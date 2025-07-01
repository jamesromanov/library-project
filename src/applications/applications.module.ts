import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, RedisService, PrismaService],
})
export class ApplicationsModule {}
