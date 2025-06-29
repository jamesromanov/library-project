import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from './multer.options';

@Module({
  imports: [
    CloudinaryModule,
    MulterModule.register({ ...multerConfig, ...multerOptions }),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
