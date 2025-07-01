import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsSemVer,
  IsString,
  Matches,
} from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    type: 'string',
    default: 'yangi zayavka nomi',
    description: 'Zayavka nomi',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    default: '998999999999',
    description: 'Zayavka nomeri ',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^998[012345789][0-9]{8}$/, { message: 'Raqam yaroqsiz' })
  phone: string;

  @ApiProperty({
    type: 'string',
    default: 'Salom men nimagadur tushunmadim',
    description: 'Zayavka savoli',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    type: 'boolean',
    default: true,
    description: 'Zayavka statusi',
  })
  @IsBoolean()
  active: boolean = true;
}
