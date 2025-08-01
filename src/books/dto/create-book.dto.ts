import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
} from 'class-validator';
import { Languages } from '../languages';
import { Transform, Type } from 'class-transformer';
import { parse } from 'path';
import { escape } from 'querystring';
import { BookCategories } from '../catigories';

export class CreateBookDto {
  @ApiProperty({
    type: 'string',
    default: 'Sariq devni minib',
    description: 'Kitob nomi',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
    default: "Xudoyberdi To'xtaboyev",
    description: 'Kitob aftori',
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Kitob rasmi',
  })
  image: Express.Multer.File;

  @ApiProperty({
    type: 'number',
    default: 2025,
    description: 'Kitob chiqarilgan sanasi',
  })
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @Max(2025)
  publishedYear: number;

  @ApiProperty({
    type: 'string',
    required: false,
    default: "Bu zo'r kitob",
    description: 'Kitob haqida',
  })
  @IsString()
  description?: string;

  @ApiProperty({ type: 'string', default: 'pdf', description: 'Kitob formati' })
  @IsNotEmpty()
  @IsString()
  format: string;

  @ApiProperty({
    type: 'number',
    default: 120,
    description: 'Kitob betlari soni',
  })
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => {
    return Number(value);
  })
  pages: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Kitob pdf',
  })
  file: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    enum: Languages,
    default: Languages.UZ,
    description: 'Kitob tili',
  })
  language: Languages;

  @ApiProperty({
    type: 'string',
    enum: BookCategories,
    description: 'Kitob katigoriyasi',
  })
  @IsString()
  @IsEnum(BookCategories)
  category: BookCategories;
  @ApiProperty({ type: 'boolean', default: true, description: 'Book statusi' })
  @Type(() => Boolean)
  @IsBoolean()
  active: boolean;
}
