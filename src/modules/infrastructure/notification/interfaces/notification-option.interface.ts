import { NotificationChannel, NotificationPriority } from '@/shared';

export interface INotificationOptions {
  channel: NotificationChannel;
  priority?: NotificationPriority;
  retryAttempts?: number;
  retryDelay?: number;
  templateId?: string;
  data?: Record<string, any>;
}

export interface IAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}
