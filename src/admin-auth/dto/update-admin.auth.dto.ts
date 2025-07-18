import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { AdminRole } from '../admin.role';
import { Transform } from 'class-transformer';

export class UpdateAdminAuthDto {
  @ApiProperty({
    type: 'string',
    default: 'Asilbek',
    description: 'Admin yoki ismi',
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '' || value.length > 1) return undefined;
    return value;
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    type: 'string',
    default: 'Kimdirov',
    description: 'Admin yoki familiyasi',
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '' || value.length < 1) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    type: 'string',
    description: 'admin tugilgan sanasi',
    required: false,

    default: '12/12/2001',
  })
  @Transform(({ value }) => {
    if (value === '' || value.length < 1) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  birthday?: string;

  @ApiProperty({
    type: 'string',
    description: 'admin shahari',
    required: false,

    default: 'qayerdir',
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    type: 'string',
    description: 'admin postal code',
    required: false,

    default: '13343',
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({
    format: 'binary',
    type: 'string',
    description: 'ADMIN rasmi',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    default: 'exmaple@gmail.com',
    description: 'Admin emaili',
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return value;
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
    description: 'Admin paroli',
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return value;
  })
  @IsOptional()
  @IsString()
  @IsStrongPassword({ minLength: 6 })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Parol kamida 1 ta katta harf, bitta kichkina harf, bitta raqam va bitta belgidan iborat bolishi kerak.',
  })
  password?: string;
}
