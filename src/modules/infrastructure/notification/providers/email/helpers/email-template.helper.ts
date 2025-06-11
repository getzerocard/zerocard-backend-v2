import { accountVerificationTemplate } from '../views';
import { NotificationEvent } from '../../../interfaces';
import { EmailTemplateData } from '../views/interfaces';
import { SEND_2FA_MFA_TOKEN } from '@/shared';

export const getTemplateForEvent = (eventName: string) => {
  switch (eventName) {
    case SEND_2FA_MFA_TOKEN:
      return accountVerificationTemplate;
    default:
      throw new Error(`No template found for event: ${eventName}`);
  }
};

/**
 * Preview text is the text that is displayed in the email preview.
 */
export const getDefaultTemplateData = (userName: string): EmailTemplateData => ({
  header: '',
  greeting: 'Hi', // this is the greeting message in the email, e.g Hi, Hello, Dear, etc.
  userName, // the name of the email recipient
  closingMessage: 'Warm Regards,', // this is the closing message in the email
  signature: 'Team at zerocard', // this is the signature of the email, can be the company name or a person's name, etc.
});

export const getTemplateData = (event: NotificationEvent): EmailTemplateData => {
  const defaultTemplateData = getDefaultTemplateData(event.userName);

  switch (event.eventName) {
    case SEND_2FA_MFA_TOKEN:
      return {
        ...defaultTemplateData,
        header: 'Your OTP Code',
        code: event.otp,
      };
    default:
      return defaultTemplateData;
  }
};
