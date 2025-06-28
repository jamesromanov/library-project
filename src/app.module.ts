import { Module } from '@nestjs/common';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AdminAuthModule, PrismaModule],
})
export class AppModule {}
