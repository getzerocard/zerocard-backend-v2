import { EmailTemplate } from '../interfaces/email-template.interface';

export const accountVerificationTemplate: EmailTemplate = {
  name: 'account-verification',
  subject: 'Verify your email address',
  html: `
    <p>Thank you for registering with Duerents! To verify your email address, please use the following verification code:</p>
    <div class="verification-code">{{code}}</div>
    <p>This code will expire in 10 minutes.</p>
    <p>If you did not request this verification code, please ignore this email.</p>
    <p>Regards,<br>The Duerents Team</p>
  `,
};
