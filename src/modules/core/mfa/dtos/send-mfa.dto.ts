import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type MfaContext = 'login' | 'toggle-mfa';

export class SendMfaDto {
  @ApiProperty({
    description: 'The context for which the MFA token is being sent',
    example: 'login',
    enum: ['login'],
  })
  @IsString()
  context: MfaContext;
}
