import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MfaContext } from './send-mfa.dto';

export class VerifyMfaDto {
  @ApiProperty({
    description: 'The context for which the MFA token is being verified',
    example: 'login',
    enum: ['login', 'toggle-mfa'],
  })
  @IsString()
  context: MfaContext;

  @ApiProperty({
    description: "The MFA verification code sent to the user's email",
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  token: string;
}
