import { accountVerificationTemplate } from '../views';
import { NotificationEvent } from '../../../interfaces';
import { EmailTemplateData } from '../views/interfaces';
import { ACCOUNT_CREATED } from '@/shared';

export const getTemplateForEvent = (eventName: string) => {
  switch (eventName) {
    case ACCOUNT_CREATED:
      return accountVerificationTemplate;
    default:
      throw new Error(`No template found for event: ${eventName}`);
  }
};

/**
 * Preview text is the text that is displayed in the email preview.
 */
export const getDefaultTemplateData = (
  userName: string,
): EmailTemplateData => ({
  header: '',
  greeting: 'Hi', // this is the greeting message in the email, e.g Hi, Hello, Dear, etc.
  userName, // the name of the email recipient
  closingMessage: 'Warm Regards,', // this is the closing message in the email
  signature: 'Team at Duerents', // this is the signature of the email, can be the company name or a person's name, etc.
});

export const getTemplateData = (
  event: NotificationEvent,
): EmailTemplateData => {
  const defaultTemplateData = getDefaultTemplateData(event.userName);

  switch (event.eventName) {
    case ACCOUNT_CREATED:
      return {
        ...defaultTemplateData,
        header: 'Verify Your Email',
        code: event.verificationCode,
      };
    default:
      return defaultTemplateData;
  }
};
