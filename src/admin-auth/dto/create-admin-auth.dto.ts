import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { AdminRole } from '../admin.role';

export class CreateAdminAuthDto {
  @ApiProperty({
    type: 'string',
    default: 'Asilbek',
    description: 'Admin yoki ismi',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    default: 'exmaple@gmail.com',
    description: 'Admin emaili',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Matches(/^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/, {
    message: 'Email formati xato.',
  })
  email: string;

  @ApiProperty({
    type: 'string',
    default: 'kuchliParol1:!',
    description: 'Admin paroli',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({ minLength: 6 })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Parol kamida 1 ta katta harf, bitta kichkina harf, bitta raqam va bitta belgidan iborat bolishi kerak.',
  })
  password: string;

  @ApiProperty({
    type: 'string',
    default: AdminRole.ADMIN,
    description: 'Admin role',
  })
  @IsNotEmpty()
  @IsEnum(AdminRole, { message: "Role xato kiritildi ADMIN bo'lishi kerak." })
  role: AdminRole;
}
