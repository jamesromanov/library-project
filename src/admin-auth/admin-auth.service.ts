import {
  BadRequestException,
  Injectable,
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
  async reateAdminAuth(createAdminAuth: CreateAdminAuthDto) {
    const adminExists = await this.prisma.admin.findMany({
      where: { role: AdminRole.ADMIN },
    });
    console.log(adminExists);
    // await this.prisma.admin.deleteMany({
    //   where: { role: AdminRole.ADMIN },
    // });
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
  async loginAdmin(loginAdminAuthDto: LoginAdminAuthDto, res: Response) {
    const { email, password } = loginAdminAuthDto;
    let admin: Admin;
    const adminExistsCache = await this.redis.get(`admin:${email}`);
    if (adminExistsCache) admin = JSON.parse(adminExistsCache);

    const adminExists = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (!adminExists || adminExists.role !== AdminRole.ADMIN)
      throw new NotFoundException('Admin topilmadi.');
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

    res.cookie('jwt', refreshToken, {
      maxAge: eval(process.env.COOKIE_EXP as string),
      secure: true,
      httpOnly: true,
    });

    await this.prisma.admin.update({
      where: { email },
      data: { refreshToken },
    });
    return 'Muvaffaqiyatli royhatdan otildi.';
  }

  // ADMIN access token refresh by refreshToken
  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.jwt;
    const validateToken = await this.jwt.verifyAsync(refreshToken, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });

    const adminExists = await this.findByToken(refreshToken);
    if (adminExists.id !== validateToken.id)
      throw new UnauthorizedException('Token yaroqsiz.');

    const payload = {
      id: adminExists.id,
      role: adminExists.role,
    };
  }

  async findByToken(token: string) {
    const adminExistsCache = await this.redis.get(`admin:token:${token}`);
    if (adminExistsCache) return JSON.parse(adminExistsCache);
    const adminExists = await this.prisma.admin.findUnique({
      where: { refreshToken: token },
    });
    if (!adminExists) throw new NotFoundException('Admin topilmadi.');
    return adminExists;
  }
}
