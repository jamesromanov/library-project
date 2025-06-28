import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

// ADMIN login operatoins
export class LoginAdminAuthDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({ minLength: 6 })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Parol kamida 1 ta katta harf, bitta kichkina hardf, bitta raqam va bitta belgidan iborat bolishi kerak.',
  })
  password: string;
}
