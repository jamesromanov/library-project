import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MAX,
} from 'class-validator';
import { Languages } from '../languages';
import { Type } from 'class-transformer';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiProperty({
    type: 'string',
    default: 'Sariq devni minib',
    description: 'Kitob nomi',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: 'string',
    default: "Xudoyberdi To'xtaboyev",
    description: 'Kitob aftori',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    default: 'image/url',
    description: 'Kitob rasmi',
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ type: 'number', default: 2025 })
  @IsOptional()
  @IsInt()
  @Max(2025)
  @Type(() => Number)
  publishedYear?: number;

  @ApiProperty({ type: 'number', default: 120, description: 'Kitob narxi' })
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

  @ApiProperty({ type: 'string', default: 'pdf', description: 'Kitob formati' })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({
    type: 'number',
    default: 120,
    description: 'Kitob betlari soni',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    type: 'string',
    enum: Languages,
    default: Languages.UZ,
    description: 'Kitob tili',
  })
  @IsOptional()
  language?: Languages;
  @ApiProperty({ type: 'boolean', default: true, description: 'Book statusi' })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
