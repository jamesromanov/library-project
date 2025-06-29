import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Languages } from '../languages';
import { Type } from 'class-transformer';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiProperty({ type: 'string', default: 'Sariq devni minib' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ type: 'string', default: "Xudoyberdi To'xtaboyev" })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ type: 'string', format: 'binary', default: 'image/url' })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ type: 'number', default: 2025 })
  @IsOptional()
  @IsNumber()
  publishedYear?: number;

  @ApiProperty({ type: 'number', default: 120 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ type: 'string', required: false, default: "Bu zo'r kitob" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'string', default: 'pdf' })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({ type: 'number', default: 120 })
  @IsOptional()
  @IsNumber()
  pages?: number;

  @ApiProperty({ type: 'string', enum: Languages, default: Languages.UZ })
  @IsOptional()
  language?: Languages;
}
