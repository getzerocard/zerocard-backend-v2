import { IsNotEmpty, IsString, IsNumberString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateCardDto {
  @ApiProperty({
    example: '1234567812345678',
    description: 'The 16-digit card number to activate',
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @Length(16, 16)
  cardNumber: string;

  @ApiProperty({
    example: '12/28',
    description: 'The expiry date of the card in MM/YY format',
  })
  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({
    example: '123',
    description: 'The 3-digit card CVV',
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @Length(3, 3)
  cvv: string;
}
