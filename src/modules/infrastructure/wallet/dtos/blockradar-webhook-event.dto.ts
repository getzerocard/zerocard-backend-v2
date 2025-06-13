import { IsEnum, IsObject } from 'class-validator';
import { BlockradarWebhookEvent } from '../types';

export class BlockradarWebhookEventDto {
  @IsEnum(BlockradarWebhookEvent)
  event: BlockradarWebhookEvent;

  @IsObject()
  data: Record<string, any>;
}
