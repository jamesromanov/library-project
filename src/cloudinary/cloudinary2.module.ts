import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService2 } from './2cloudinary.service';
import { CloudinaryProvider2 } from './2clodinary.provider';

@Module({
  providers: [CloudinaryProvider2, CloudinaryService2],
  exports: [CloudinaryProvider2, CloudinaryService2],
})
export class CloudinaryModule2 {}
