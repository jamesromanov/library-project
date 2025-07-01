import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Languages } from 'src/books/languages';

export class CreateNewsDto {
  @ApiProperty({
    type: 'string',
    default: 'Toshkentda Euronews vakolatxonasi ochildi',
    description: 'Yangilik nomi',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Yangilik rasmi',
  })
  image: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    description: 'Habar tavsifi',
    default:
      'Euronews - Yevropadagi 24 soatlik yangiliklar kanali bo‘lib, o‘n uch tilda jahon voqealari haqida video-yangiliklarni va audio sharhlarni namoyish etadi.',
  })
  @IsString()
  context: string;

  @ApiProperty({
    type: 'string',
    default: '29.06.25',
    description: 'Habar chiqqan sanasi',
  })
  @IsString()
  publication_date: string;

  @ApiProperty({
    type: 'string',
    default: 'Yevropa Ittifoqi',
    description: 'Habar manbasi',
  })
  @IsString()
  @IsOptional()
  source: string;

  @ApiProperty({
    type: 'string',
    enum: Languages,
    default: Languages.UZ,
    description: 'Habar tili',
  })
  language: Languages;

  @ApiProperty({ type: 'boolean', default: true, description: 'Habar status' })
  @Type(() => Boolean)
  @IsBoolean()
  active: boolean = true;
}
