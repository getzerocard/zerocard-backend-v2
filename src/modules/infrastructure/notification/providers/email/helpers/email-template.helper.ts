import { NotificationEvent } from '../../../interfaces';
import { EmailTemplateData } from '../views/interfaces';
import { signInOtpTemplate } from '../views';
import { SEND_SIGN_IN_OTP } from '@/shared';

export const getTemplateForEvent = (eventName: string) => {
  switch (eventName) {
    case SEND_SIGN_IN_OTP:
      return signInOtpTemplate;
    default:
      throw new Error(`No template found for event: ${eventName}`);
  }
};

/**
 * Preview text is the text that is displayed in the email preview.
 */
export const getDefaultTemplateData = (userName: string): EmailTemplateData => ({
  greeting: 'Hey',
  userName: '', // the name of the email recipient
  closingMessage: 'Warm Regards,', // this is the closing message in the email
  signature: 'Team at zerocard', // this is the signature of the email, can be the company name or a person's name, etc.
});

export const getTemplateData = (event: NotificationEvent): EmailTemplateData => {
  const defaultTemplateData = getDefaultTemplateData(event.userName);

  switch (event.eventName) {
    case SEND_SIGN_IN_OTP:
      return {
        ...defaultTemplateData,
        otp: event.otp,
        loginTime: event.loginTime,
        loginLocation: event.loginLocation,
        loginIP: event.loginIP,
      };
    default:
      return defaultTemplateData;
  }
};
