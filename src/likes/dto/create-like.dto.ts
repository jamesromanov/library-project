import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLikeDto {

  @ApiProperty({
    type: 'string',
    default: 'kitob idsi',
    description: 'like kitob idsi',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @ApiProperty({
    type: 'number',
    default: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  likesCount: number = 1;
}
