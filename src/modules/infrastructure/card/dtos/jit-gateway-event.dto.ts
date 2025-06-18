import { IsEnum, IsObject } from 'class-validator';
import { JitGatewayWebhookEvent } from '../types';

export class JitGatewayEventDto {
  @IsEnum(JitGatewayWebhookEvent)
  event: JitGatewayWebhookEvent;

  @IsObject()
  data: Record<string, any>;
}
