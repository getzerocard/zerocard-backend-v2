import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class CompleteSignInDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class OAuthSigninDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
