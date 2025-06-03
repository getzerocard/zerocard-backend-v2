import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyPasswordResetTokenDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(email => email.value.trim().toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
