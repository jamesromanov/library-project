import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryService2 } from './2cloudinary.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService, CloudinaryService2],
  exports: [CloudinaryProvider, CloudinaryService, CloudinaryService2],
})
export class CloudinaryModule {}
