import { EmailTemplate } from '../interfaces/email-template.interface';

export const welcomeTemplate: EmailTemplate = {
  name: 'welcome',
  subject: 'Welcome to mystocks.africa',
  html: `
    <tr>
      <td>
        <p>
          We're thrilled to have you join our community of investors and
          traders. Your account has been successfully verified and you're now
          ready to start your investment journey with us.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <h3>Getting Started</h3>
        <p>Here are a few things you can do to get started:</p>
        <div class="steps">
          <div class="step-item">
            <span class="step-number">01.</span>
            <div>Complete your profile and verify your identity</div>
          </div>
          <div class="step-item">
            <span class="step-number">02.</span>
            <div>Set up your investment preferences</div>
          </div>
          <div class="step-item">
            <span class="step-number">03.</span>
            <div>Explore our market insights and analysis</div>
          </div>
          <div class="step-item">
            <span class="step-number">04.</span>
            <div>Connect with other investors in our community</div>
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <h3>Security First</h3>
        <p>To ensure the security of your account:</p>
        <div class="steps">
          <div class="step-item">
            <span class="step-number">✓</span>
            <div>Enable two-factor authentication (2FA)</div>
          </div>
          <div class="step-item">
            <span class="step-number">✓</span>
            <div>Set up a strong password</div>
          </div>
          <div class="step-item">
            <span class="step-number">✓</span>
            <div>Keep your contact information up to date</div>
          </div>
        </div>
      </td>
    </tr>
  `,
};
