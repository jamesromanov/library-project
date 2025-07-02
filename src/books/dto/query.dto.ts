import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Languages } from '../languages';
import { BookCategories } from '../catigories';

export class QueryDto {
  @Type(() => Number)
  @IsInt()
  limit: number;
  @Type(() => Number)
  @IsInt()
  page: number;
  @IsEnum(Languages)
  @IsOptional()
  language?: Languages;
  @IsString()
  @IsOptional()
  @IsEnum(BookCategories)
  category?: BookCategories;
}
