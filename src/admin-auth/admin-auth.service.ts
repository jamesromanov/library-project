import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { AdminRole } from './admin.role';
import * as bcyrpt from 'bcrypt';
import { LoginAdminAuthDto } from './dto/login-admin-auth.dto';
import { RedisService } from 'src/redis/redis.service';
import { Admin } from 'generated/prisma';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private redis: RedisService,
  ) {}
  async reateAdminAuth(createAdminAuth: CreateAdminAuthDto) {
    const adminExists = await this.prisma.admin.findMany({
      where: { role: AdminRole.ADMIN },
    });
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

  async loginAdmin(loginAdminAuthDto: LoginAdminAuthDto) {
    const { email, password } = loginAdminAuthDto;
    let admin: Admin;
    const adminExistsCache = await this.redis.get(`admin:${email}`);
    if (adminExistsCache) admin = JSON.parse(adminExistsCache);

    const adminExists = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (!adminExists || adminExists.role !== AdminRole.ADMIN)
      throw new NotFoundException('Admin topilmadi.');
  }
}
