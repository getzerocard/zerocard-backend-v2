import { SendResponse, INotification } from '../interfaces';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  SesProvider,
  EmailTemplateRendererService,
  getTemplateData,
  getTemplateForEvent,
} from '../providers';
import { NotificationStatus } from '@/shared';

@Injectable()
export class EmailService {
  constructor(
    private readonly sesProvider: SesProvider,
    private readonly templateRenderer: EmailTemplateRendererService,
    private logger: PinoLogger,
  ) {
    this.logger.setContext(EmailService.name);
  }

  async send(notification: INotification): Promise<SendResponse> {
    try {
      // Get the appropriate template based on the event name
      const template = getTemplateForEvent(notification.event.eventName);

      // Get the template data based on the event
      const templateData = getTemplateData(notification.event);

      // Render the template with the data
      const recipient = notification.recipient;
      const renderedTemplate = this.templateRenderer.renderTemplate(template, templateData);

      this.logger.info(`Sending email to ${recipient} with template ${renderedTemplate.name}`);
      await this.sesProvider.send({
        to: recipient,
        template: renderedTemplate,
      });

      this.logger.info(`Email sent to ${recipient} with template ${renderedTemplate.name}`);

      return {
        status: NotificationStatus.SENT,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      return {
        status: NotificationStatus.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
