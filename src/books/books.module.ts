import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from './multer.options';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    CloudinaryModule,

    MulterModule.register({ ...multerConfig, ...multerOptions }),
  ],
  controllers: [BooksController],
  providers: [BooksService, PrismaService, RedisService],
})
export class BooksModule {}
