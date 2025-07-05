import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

// USER login operatoins
export class LoginUserAuthDto {
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
}
