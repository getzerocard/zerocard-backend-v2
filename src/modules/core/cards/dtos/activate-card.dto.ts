import { IsNotEmpty, IsString, IsNumberString, Length } from 'class-validator';

export class ActivateCardDto {
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @Length(16, 16)
  number: string;

  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @Length(16, 16)
  cvv: string;
}
