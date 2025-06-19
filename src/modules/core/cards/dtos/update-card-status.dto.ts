import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCardStatusDto {
  @ApiProperty({
    enum: ['active', 'inactive'],
    example: 'inactive',
    description: 'The new status for the card. Use "inactive" to freeze and "active" to unfreeze.',
  })
  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive';
}
