import { EmailTemplate } from '../interfaces/email-template.interface';

export const passwordChangedTemplate: EmailTemplate = {
  name: 'password-changed',
  subject: 'Your password has been changed',
  html: `
    <tr>
      <td>
        <p>
          We have detected a password change for your mystocks.africa account.
          If you initiated this change, you can safely disregard this message.
          However, if you did not request a password change, we recommend that you take immediate action to secure your account.
        </p>
      </td>
    </tr>

    <tr>
      <td>
        <h3>Security Actions</h3>
        <p>If this wasn't you, please take these steps immediately:</p>
        <div class="steps">
          <div class="step-item">
            <span class="step-number">1.</span>
            <div>Reset your password</div>
          </div>
          <div class="step-item">
            <span class="step-number">2.</span>
            <div>Enable two-factor authentication if not already enabled</div>
          </div>
          <div class="step-item">
            <span class="step-number">3.</span>
            <div>Review your recent account activity</div>
          </div>
        </div>
      </td>
    </tr>
  `,
};
