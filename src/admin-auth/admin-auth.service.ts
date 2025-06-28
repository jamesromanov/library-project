import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { AdminRole } from './admin.role';

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService) {}
  async reateAdminAuth(createAdminAuth: CreateAdminAuthDto) {
    const adminExists = await this.prisma.admin.findMany({
      where: { role: AdminRole.ADMIN },
    });
    console.log(adminExists);
    if (adminExists.length && adminExists[0].role === AdminRole.ADMIN) {
      throw new BadRequestException(
        "Admin oldin qo'shilgan.Ikkinchi admin yaratish mumkin emas.",
      );
    }

    const admin = await this.prisma.admin.create({ data: createAdminAuth });
    return admin;
  }
}
