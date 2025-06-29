import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class QueryDto {
  @Type(() => Number)
  @IsInt()
  limit: number;
  @Type(() => Number)
  @IsInt()
  page: number;
}
