import { INotificationOptions } from './';
import { NotificationStatus } from '@/shared';

export type NotificationEvent = any;

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
