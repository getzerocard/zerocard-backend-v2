import { ConfigService } from '@nestjs/config';
import { INotification, SendResponse } from '../../';
import { AbstractWhatsAppProvider } from './whatsapp-provider.abstract';

export class TwilioWhatsappProvider extends AbstractWhatsAppProvider {
  name = 'twilio-whatsapp';

  constructor(private readonly configService: ConfigService) {
    super();
  }

  send(notification: INotification): Promise<SendResponse> {
    console.log('Sending whatsapp to', notification);
    throw new Error('Method not implemented.');
  }
}
