import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global.exception.filter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import { RequestLoggerModule } from './request-logger/request-logger.module';
import { BooksModule } from './books/books.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NewsModule } from './news/news.module';
import { ApplicationsModule } from './applications/applications.module';
import { UsersModule } from './users/users.module';
import { LikesModule } from './likes/likes.module';
import { GuardMiddleware } from './nest.middleware';

@Module({
  imports: [
    AdminAuthModule,
    PrismaModule,
    RedisModule,
    // RATE limit
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 20000,
          limit: 2,
        },
      ],
      storage: new ThrottlerStorageRedisService(
        new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        }),
      ),
    }),
    RequestLoggerModule,
    BooksModule,
    CloudinaryModule,
    NewsModule,
    ApplicationsModule,
    UsersModule,
    LikesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GuardMiddleware).forRoutes('*');
  }
}
