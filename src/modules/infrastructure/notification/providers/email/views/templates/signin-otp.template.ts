import { EmailTemplate } from '../interfaces/email-template.interface';

export const signInOtpTemplate: EmailTemplate = {
  name: 'sign-in-otp',
  subject: 'Your login code is ready',
  html: `
    <tr>
      <td>
        <p class="intro-text">
          Someone is trying to access your zerocard account.  <br />
          Use the One-Time Password (OTP) below to complete your login securely. <br />
          If this wasn't you, you can safely ignore this email.
        </p>
      </td>
    </tr>

    <!-- OTP Section -->
    <tr>
      <td align="center" style="padding: 40px 0">
        <table
          role="presentation"
          border="0"
          cellpadding="0"
          cellspacing="0"
        >
          <tr>
            <td align="center">
              <div class="otp-box">
                <div class="otp-code">{{otp}}</div>
              </div>
              <p class="otp-info">
                Enter this code in the zerocard app • Expires in
                10 minutes
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Security Alert -->
    <tr>
      <td>
        <div class="security-alert">
          <span class="security-icon">🔒</span>
          <h3 class="security-title">Security First</h3>
          <p class="security-description">
            Never share your login code with anyone. zerocard will
            never ask for your code via email, phone, or social
            media. Keep your account secure!
          </p>
        </div>
      </td>
    </tr>

    <!-- Device Information -->
    <tr>
      <td>
        <div class="device-info">
          <div class="device-info-title">
            📱 Login Attempt Details
          </div>
          <table
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
          >
            <tr>
              <td
                class="device-label"
                style="
                  padding: 12px 0;
                  border-bottom: 1px solid #f0f0f0;
                "
              >
                Time
              </td>
              <td
                class="device-value"
                style="
                  padding: 12px 0;
                  border-bottom: 1px solid #f0f0f0;
                  text-align: right;
                "
              >
                {{loginTime}}
              </td>
            </tr>
            <tr>
              <td
                class="device-label"
                style="
                  padding: 12px 0;
                  border-bottom: 1px solid #f0f0f0;
                "
              >
                Location
              </td>
              <td
                class="device-value"
                style="
                  padding: 12px 0;
                  border-bottom: 1px solid #f0f0f0;
                  text-align: right;
                "
              >
                {{loginLocation}}
              </td>
            </tr>
            <tr>
              <td class="device-label" style="padding: 12px 0">
                IP Address
              </td>
              <td
                class="device-value"
                style="padding: 12px 0; text-align: right"
              >
                {{loginIP}}
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  `,
};
