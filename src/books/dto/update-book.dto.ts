import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MAX,
} from 'class-validator';
import { Languages } from '../languages';
import { Transform, Type } from 'class-transformer';
import { BookCategories } from '../catigories';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiProperty({
    type: 'string',
    default: 'Sariq devni minib',
    description: 'Kitob nomi',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: 'string',
    default: "Xudoyberdi To'xtaboyev",
    description: 'Kitob aftori',
    required: false,
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    default: 'image/url',
    description: 'Kitob rasmi',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ type: Number, default: 2025, required: false })
  @IsOptional()
  @IsInt()
  @Max(2025)
  @Type(() => Number)
  publishedYear?: number;

  @ApiProperty({
    type: Number,
    default: 120,
    description: 'Kitob narxi',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiProperty({
    type: 'string',
    required: false,
    default: "Bu zo'r kitob",
    description: 'Kitob haqida',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: Number,
    default: 120,
    description: 'Kitob betlari soni',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pages?: number;

  @ApiProperty({
    type: 'string',
    enum: Languages,
    default: Languages.UZ,
    required: false,
    description: 'Kitob tili',
  })
  @ApiProperty({ type: 'string', default: 'pdf', description: 'Kitob formati' })
  @IsOptional()
  @IsString()
  format?: string;
  @IsOptional()
  language?: Languages;
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Kitob pdf',
  })
  file?: Express.Multer.File;
  @ApiProperty({
    type: 'string',
    enum: BookCategories,
    description: 'Kitob katigoriyasi',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @IsEnum(BookCategories)
  category?: BookCategories;
  @ApiProperty({
    type: Boolean,
    description: 'Book statusi',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}
