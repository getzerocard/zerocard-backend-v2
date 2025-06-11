import { Send2FATokenEvent, SendSignInOtpEvent } from '@/modules/infrastructure/events/definitions';
import { NotificationStatus } from '@/shared';
import { INotificationOptions } from './';

export type NotificationEvent = Send2FATokenEvent | SendSignInOtpEvent;

export interface INotification {
  id?: string;
  recipient: string;
  subject?: string;
  content?: string;
  options: INotificationOptions;
  event: NotificationEvent;
  status?: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
}
