import { Module } from '@nestjs/common';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [AdminAuthModule, PrismaModule, RedisModule],
})
export class AppModule {}
