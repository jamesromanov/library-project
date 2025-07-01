import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @ApiProperty({
    type: 'string',
    default: 'yangi zayavka nomi',
    description: 'Zayavka nomi',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: 'string',
    default: '+998999999999',
    description: 'Zayavka nomeri',
  })
  @IsString()
  @IsOptional()
  @Matches(/^998[012345789][0-9]{8}$/, { message: 'Raqam yaroqsiz' })
  phone?: string;

  @ApiProperty({
    type: 'string',
    default: 'Salom men nimagadur tushunmadim',
    description: 'Zayavka savoli',
  })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiProperty({
    type: 'boolean',
    default: true,
    description: 'Zayavka statusi',
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}
