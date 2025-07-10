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

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
  ) {}
  // ADMIN register (only once if the admin doesn't exist) can be only one admin
  async createAdminAuth(createAdminAuth: CreateAdminAuthDto) {
    const adminExists = await this.prisma.admin.findMany({
      where: { role: AdminRole.ADMIN },
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
    await this.prisma.admin.create({ data: createAdminAuth });
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

  async findOne(id: string) {
    const adminExists = await this.prisma.admin.findUnique({ where: { id } });
    if (!adminExists) throw new UnauthorizedException('Admin topilmadi.');
    return adminExists;
  }
}
