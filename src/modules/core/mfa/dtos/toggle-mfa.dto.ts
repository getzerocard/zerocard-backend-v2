import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleMfaDto {
  @ApiProperty({
    description: 'Whether to enable or disable MFA for the user',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;
}
