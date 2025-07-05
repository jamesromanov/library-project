import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { AdminRole } from 'src/admin-auth/admin.role';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    type: 'string',
    default: 'Avazbek',
    description: 'User ismi',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: 'string',
    default: 'exmaple@gmail.com',
    description: 'User emaili',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @Matches(/^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/, {
    message: 'Email formati xato.',
  })
  email?: string;

  @ApiProperty({
    type: 'string',
    default: 'kuchliParol1:!',
    description: 'User paroli',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsStrongPassword({ minLength: 6 })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Parol kamida 1 ta katta harf, bitta kichkina harf, bitta raqam va bitta belgidan iborat bolishi kerak.',
  })
  password?: string;

  @ApiProperty({
    type: 'string',
    default: AdminRole.USER,
    description: 'User role',
    required: false,
  })
  @IsOptional()
  @IsEnum(AdminRole, { message: "Role xato kiritildi ADMIN bo'lishi kerak." })
  role?: AdminRole;
}
