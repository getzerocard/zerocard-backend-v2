import { NotificationChannel } from '@/shared';
import { ChannelProvider, INotification, SendResponse } from '../..';

export abstract class AbstractWhatsAppProvider implements ChannelProvider {
  abstract name: string;
  abstract send(notification: INotification): Promise<SendResponse>;

  canHandle(notification: INotification): boolean {
    return notification.options.channel === NotificationChannel.WHATSAPP;
  }

  validateInput(notification: INotification): boolean {
    if (!notification.recipient) {
      return false;
    }

    // Basic phone number validation
    const recipients = Array.isArray(notification.recipient)
      ? notification.recipient
      : [notification.recipient];

    // Simple pattern for international phone numbers: + followed by digits
    const phoneRegex = /^\+[0-9]{10,15}$/;

    return recipients.every((phone) => phoneRegex.test(phone));
  }

  protected formatRecipients(recipients: string | string[]): string[] {
    return Array.isArray(recipients) ? recipients : [recipients];
  }
}
