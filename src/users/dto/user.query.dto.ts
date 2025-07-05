import { Type } from 'class-transformer';
import { IsInt, IsNumber } from 'class-validator';

export class UserQueryDto {
  @Type(() => Number)
  @IsInt()
  limit: number;
  @Type(() => Number)
  @IsInt()
  page: number;
}
