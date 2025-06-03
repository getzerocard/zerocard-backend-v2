import { INotification, SendResponse } from '../../';
import { AbstractSmsProvider } from './sms-provider.abstract';

export class TwilioSmsProvider extends AbstractSmsProvider {
  send(notification: INotification): Promise<SendResponse> {
    console.log('Sending sms to', notification);
    throw new Error('Method not implemented.');
  }
  name = 'twilio';
}
