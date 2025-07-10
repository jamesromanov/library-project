import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { AdminRole } from 'src/admin-auth/admin.role';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    default: 'Avazbek',
    description: 'User ismi',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    default: 'exmaple@gmail.com',
    description: 'User emaili',
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
    description: 'User paroli',
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
    default: AdminRole.USER,
    description: 'User role',
  })
  @IsOptional()
  @IsEnum(AdminRole, { message: "Role xato kiritildi USER bo'lishi kerak." })
  role: AdminRole = AdminRole.USER;

  @ApiProperty({
    type: 'boolean',
    default: true,
    description: 'foydalanuvchi statusi',
  })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
