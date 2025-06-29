import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Languages } from '../languages';

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
}
