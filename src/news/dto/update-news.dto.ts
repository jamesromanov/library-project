import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Languages } from 'src/books/languages';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @ApiProperty({
    type: 'string',
    default: 'Toshkentda Euronews vakolatxonasi ochildi',
    description: 'Yangilik nomi',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Yangilik rasmi',
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    description: 'Habar tavsifi',
    default:
      'Euronews - Yevropadagi 24 soatlik yangiliklar kanali bo‘lib, o‘n uch tilda jahon voqealari haqida video-yangiliklarni va audio sharhlarni namoyish etadi.',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiProperty({
    type: 'string',
    default: '29.06.25',
    description: 'Habar chiqqan sanasi',
    required: false,
  })
  @IsString()
  @IsOptional()
  publication_date?: string;

  @ApiProperty({
    type: 'string',
    default: 'Yevropa Ittifoqi',
    description: 'Habar manbasi',
    required: false,
  })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({
    type: 'string',
    enum: Languages,
    default: Languages.UZ,
    description: 'Habar tili',
    required: false,
  })
  @IsString()
  @IsOptional()
  language: string;

  @ApiProperty({ type: 'boolean', default: true, description: 'Habar status' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
