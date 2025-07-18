import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { AdminRole } from './admin.role';
import * as bcyrpt from 'bcrypt';
import { LoginAdminAuthDto } from './dto/login-admin-auth.dto';
import { RedisService } from 'src/redis/redis.service';
import { Admin } from 'generated/prisma';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AdminInterface } from './admin';
import { UpdateAdminAuthDto } from './dto/update-admin.auth.dto';
import { throwIfEmpty } from 'rxjs';
import { CustomExpress } from 'src/global.type';
import { userInfo } from 'os';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private redis: RedisService,
    private jwt: JwtService,
  ) {}
  // ADMIN register (only once if the admin doesn't exist) can be only one admin
  async createAdminAuth(
    createAdminAuth: CreateAdminAuthDto,
    image: Express.Multer.File,
  ) {
    const adminExists = await this.prisma.admin.findMany({
      where: { role: AdminRole.ADMIN },
    });

    const imageUrl = await this.cloudinaryService
      .uploadImage(image)
      .then((data) => {
        return data.secure_url;
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException('Rasm yuklashda haxtolik');
      });
    console.log(adminExists);

    if (adminExists.length && adminExists[0].role === AdminRole.ADMIN) {
      throw new BadRequestException(
        "Admin oldin qo'shilgan.Ikkinchi admin yaratish mumkin emas.",
      );
    }

    createAdminAuth.password = await bcyrpt.hash(
      createAdminAuth.password,
      Number(process.env.HASH_SALT),
    );
    await this.prisma.admin.create({
      data: { ...createAdminAuth, image: imageUrl },
    });
    console.log(imageUrl, createAdminAuth);
    return "Muvaffaqiyatli Qo'shildi!";
  }

  // ADMIN login refresh based token sharing
  async loginAdmin(loginAdminAuthDto: LoginAdminAuthDto) {
    const { email, password } = loginAdminAuthDto;
    let admin: Admin;
    const adminExistsCache = await this.redis.get(`admin:${email}`);
    if (adminExistsCache) admin = JSON.parse(adminExistsCache);

    const adminExists = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (!adminExists || adminExists.role !== AdminRole.ADMIN)
      throw new NotFoundException('Parol yoki email xato.');

    const comparePassword = await bcyrpt.compare(
      password,
      adminExists.password,
    );
    if (!comparePassword)
      throw new BadRequestException('Parol yoki email xato.');
    await this.redis.set(`admin:${email}`, adminExists);
    admin = adminExists;
    const payload = {
      id: admin.id,
      role: admin.role,
    };
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_EXP,
    });

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: process.env.ACCESS_TOKEN_EXP,
    });

    await this.prisma.admin.update({
      where: { email },
      data: { refreshToken },
    });
    return { refreshToken, accessToken };
  }
  // FIND admin by token
  async findByToken(token: string) {
    const adminExistsCache = await this.redis.get(`admin:token:${token}`);
    if (adminExistsCache) return JSON.parse(adminExistsCache);
    const adminExists = await this.prisma.admin.findUnique({
      where: { refreshToken: token },
    });
    if (!adminExists) throw new NotFoundException('Admin topilmadi.');
    return adminExists;
  }
  // ADMIN findone
  async findOne(id: string) {
    const adminCache = await this.redis.get(`adminid`);
    if (adminCache) return JSON.parse(adminCache);
    const adminExists = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!adminExists) throw new UnauthorizedException('Admin topilmadi.');
    await this.redis.set('adminid', adminExists);
    return adminExists;
  }
  // [GET] admin
  async getAdmin() {
    const adminCache = await this.redis.get(`admin`);
    console.log(adminCache);
    if (adminCache) return JSON.parse(adminCache);
    const adminExists = await this.prisma.admin.findMany({
      where: { role: AdminRole.ADMIN },
    });
    if (adminExists.length === 0)
      throw new NotFoundException('Admin topilmadi');
    const adminHide = JSON.parse(JSON.stringify(adminExists[0]));
    delete adminHide.refreshToken;
    delete adminHide.password;
    delete adminHide.role;
    await this.redis.set('admin', adminHide);
    return adminHide as AdminInterface;
  }
  //  [PUT] admin
  async updateAdmin(
    req: CustomExpress,
    updateAdminAuthDto: UpdateAdminAuthDto,
    image?: Express.Multer.File,
  ) {
    console.log(req.user.id, 'sadasdasasd');
    const adminExists = await this.findOne(req.user.id);
    updateAdminAuthDto.password =
      updateAdminAuthDto.password !== undefined
        ? await bcyrpt.hash(updateAdminAuthDto.password, 12)
        : undefined;
    const imageUrl =
      image !== undefined
        ? await this.cloudinaryService
            .uploadImage(image)
            .then(async (data) => {
              return await data.secure_url;
            })
            .catch((err) => {
              throw new BadRequestException('Rasm yangilashda hatolik');
            })
        : undefined;
    console.log(adminExists);

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminExists.id },
      data: { ...updateAdminAuthDto, image: imageUrl },
    });
    await this.redis.del('admin:get');
    await this.redis.del('admin');
    return updatedAdmin;
  }

  async getStatistics() {
    const stsCache = await this.redis.get(`sts:admin`);
    console.log(stsCache);
    if (stsCache) return JSON.parse(stsCache);

    const [books, news, users, likes] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.new.count(),
      this.prisma.user.count(),
      this.prisma.like.count(),
    ]);

    await this.redis.set(`sts:admin`, { books, news, users, likes });
    return { books, news, users, likes };
  }
}
