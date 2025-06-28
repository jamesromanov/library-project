import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { AdminRole } from './admin.role';

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService) {}
  async reateAdminAuth(createAdminAuth: CreateAdminAuthDto) {
    const adminExists = await this.prisma.admin.findFirst();
    if (adminExists && adminExists.role === AdminRole.ADMIN) {
      throw new BadRequestException(
        "Admin oldin qo'shilgan.Ikkinchi admin yaratish mumkin emas.",
      );
    }
  }
}
