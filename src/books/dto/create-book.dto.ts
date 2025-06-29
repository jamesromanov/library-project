import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Languages } from '../languages';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({ type: 'string', default: 'Sariq devni minib' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: 'string', default: "Xudoyberdi To'xtaboyev" })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  image: Express.Multer.File;

  @ApiProperty({ type: 'number', default: 2025 })
  @IsNumber()
  publishedYear: number;

  @ApiProperty({ type: 'number', default: 120 })
  @IsNumber()
  price: number;

  @ApiProperty({ type: 'string', required: false, default: "Bu zo'r kitob" })
  @IsString()
  description?: string;

  @ApiProperty({ type: 'string', default: 'pdf' })
  @IsNotEmpty()
  @IsString()
  format: string;

  @ApiProperty({ type: 'number', default: 120 })
  @IsNumber()
  pages: number;

  @ApiProperty({ type: 'string', enum: Languages, default: Languages.UZ })
  language: Languages;
}
