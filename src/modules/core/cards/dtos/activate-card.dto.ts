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
  @Length(16, 18) // TODO: Change to 16, we are using 18 for testing purposes
  cardNumber: string;
}
