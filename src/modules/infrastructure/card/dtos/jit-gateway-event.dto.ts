import { IsBoolean, IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { JitGatewayWebhookEvent } from '../types';

export class JitGatewayEventDto {
  @IsString()
  environment: string;

  @IsString()
  business: string;

  @IsObject()
  data: Record<string, any>;

  @IsEnum(JitGatewayWebhookEvent)
  type: JitGatewayWebhookEvent;

  @IsBoolean()
  pendingWebhook: boolean;

  @IsBoolean()
  webhookArchived: boolean;

  @IsNumber()
  createdAt: number;

  @IsString()
  _id: string;
}
