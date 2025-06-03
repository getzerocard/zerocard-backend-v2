import { EmailTemplate } from './email-template.interface';

export interface EmailProviderOptions {
  to: string;
  template: EmailTemplate;
}

export interface EmailProvider {
  send(options: EmailProviderOptions): Promise<void>;
  getProviderName(): string;
}
