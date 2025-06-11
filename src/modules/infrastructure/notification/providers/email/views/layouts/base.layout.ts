import { EmailLayout } from '../interfaces';

export const baseLayout: EmailLayout = {
  name: 'base',
  html: `
    <!DOCTYPE html>
    <html
      lang="en"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
    >
      <head>
        <meta charset="utf-8" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="format-detection"
          content="telephone=no, date=no, address=no, email=no"
        />
        <title>zerocard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <!--[if mso]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <style>
            td,
            th,
            div,
            p,
            a,
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              font-family: "Segoe UI", sans-serif;
              mso-line-height-rule: exactly;
            }
          </style>
        <![endif]-->
        <style>
          html,
          body {
            margin: 0 auto !important;
            padding: 40px 0 0 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #f0f2f5 !important;
          }
          * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            box-sizing: border-box;
          }
          div[style*="margin: 16px 0"] {
            margin: 0 !important;
          }
          #MessageViewBody,
          #MessageWebViewDiv {
            width: 100% !important;
          }
          table,
          td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
          }
          table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
          }
          img {
            -ms-interpolation-mode: bicubic;
            max-width: 100%;
            border: 0;
          }
          p {
            margin: 0;
            padding: 0;
            font-family: "Inter", Arial, sans-serif;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          .hero-section {
            background: #1f1f1f;
            background: linear-gradient(
              135deg,
              #1f1f1f 0%,
              #333333 50%,
              #40ff00 100%
            );
            background-image: radial-gradient(
                circle at 20% 80%,
                rgba(64, 255, 0, 0.1) 0%,
                transparent 50%
              ),
              radial-gradient(
                circle at 80% 20%,
                rgba(255, 255, 255, 0.05) 0%,
                transparent 50%
              ),
              radial-gradient(
                circle at 40% 40%,
                rgba(64, 255, 0, 0.08) 0%,
                transparent 50%
              );
            text-align: center;
          }
          .logo {
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 16px 24px;
          }
          .greeting {
            font-family: "Inter", Arial, sans-serif;
            font-size: 20px;
            font-weight: 600;
            color: #1f1f1f;
            margin-bottom: 24px;
          }
          .intro-text {
            font-family: "Inter", Arial, sans-serif;
            font-size: 16px;
            font-weight: 400;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 40px;
          }
          .otp-label {
            font-family: "Inter", Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #666666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }
          .otp-box {
            display: inline-block;
            background: #1f1f1f;
            border: 2px solid #40ff00;
            border-radius: 8px;
            padding: 24px 32px;
            margin-bottom: 16px;
          }
          .otp-code {
            font-family: "Inter", Arial, sans-serif;
            font-size: 36px;
            font-weight: 700;
            color: #40ff00;
            letter-spacing: 10px;
            margin: 0;
          }
          .otp-info {
            font-family: "Inter", Arial, sans-serif;
            font-size: 14px;
            color: #999999;
            margin: 0;
          }
          .security-alert {
            background: #fff8e1;
            border: 1px solid #ffcc02;
            border-left: 4px solid #ff9800;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
          }
          .security-icon {
            font-size: 32px;
            margin-bottom: 12px;
            display: block;
          }
          .security-title {
            font-family: "Inter", Arial, sans-serif;
            font-size: 18px;
            font-weight: 600;
            color: #1f1f1f;
            margin-bottom: 8px;
          }
          .security-description {
            font-family: "Inter", Arial, sans-serif;
            font-size: 14px;
            color: #666666;
            line-height: 1.5;
            margin: 0;
          }
          .device-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
          }
          .device-info-title {
            font-family: "Inter", Arial, sans-serif;
            font-size: 16px;
            font-weight: 600;
            color: #1f1f1f;
            margin-bottom: 16px;
          }
          .device-label {
            font-family: "Inter", Arial, sans-serif;
            font-size: 14px;
            color: #666666;
            font-weight: 500;
            width: 30%;
          }
          .device-value {
            font-family: "Inter", Arial, sans-serif;
            font-size: 14px;
            color: #1f1f1f;
            font-weight: 600;
          }
          .support-text {
            font-family: "Inter", Arial, sans-serif;
            font-size: 14px;
            color: #666666;
            line-height: 1.5;
            margin-bottom: 24px;
          }
          .signature {
            font-family: "Inter", Arial, sans-serif;
            font-size: 16px;
            font-weight: 600;
            color: #1f1f1f;
            margin-bottom: 4px;
          }
          .tagline {
            font-family: "Inter", Arial, sans-serif;
            font-size: 12px;
            font-weight: 500;
            color: #40ff00;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 32px;
          }
          .social-icons {
            margin-bottom: 24px;
          }
          .social-icons a {
            display: inline-block;
            margin: 0 12px;
            padding: 12px;
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .social-icons img {
            width: 20px;
            height: 20px;
            vertical-align: middle;
          }
          .copyright {
            font-family: "Inter", Arial, sans-serif;
            font-size: 12px;
            color: #999999;
            margin: 0;
          }
          a:not(.cta-button) {
            color: #40ff00 !important;
            text-decoration: none;
            font-weight: 500;
          }
          @media screen and (max-width: 600px) {
            .email-container {
              margin: 0;
              border-radius: 0;
            }
            .otp-code {
              font-size: 28px !important;
              letter-spacing: 4px !important;
            }
          }
        </style>
      </head>
      <body style="word-spacing: normal; background: #f0f2f5">
        <table
          align="center"
          role="presentation"
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="padding: 40px 40px 80px 40px; background: #f0f2f5"
        >
          <tr>
            <td align="center">
              <table
                align="center"
                role="presentation"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="600"
                style="
                  max-width: 600px;
                  background: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                "
              >
                <!-- Hero Section -->
                <tr>
                  <td
                    align="center"
                    style="
                      background: #1f1f1f;
                      background: linear-gradient(
                        135deg,
                        #1f1f1f 0%,
                        #333333 50%,
                        #40ff00 100%
                      );
                      padding: 48px 40px;
                      text-align: center;
                    "
                  >
                    <!--[if gte mso 9]>
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:144px;">
                    <v:fill type="gradient" color="#1f1f1f" color2="#40ff00" angle="135" />
                    <v:textbox inset="0,48px,0,48px">
                    <![endif]-->
                    <table
                      role="presentation"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                    >
                      <tr>
                        <td align="center">
                          <div class="logo">
                            <img
                              src="https://zcrd.s3.us-east-1.amazonaws.com/zerocard.png"
                              alt="zerocard"
                              style="
                                height: 40px;
                                width: auto;
                                display: block;
                                margin: 0 auto;
                              "
                            />
                          </div>
                        </td>
                      </tr>
                    </table>
                    <!--[if gte mso 9]>
                    </v:textbox>
                    </v:rect>
                    <![endif]-->
                  </td>
                </tr>

                <!-- Content Section -->
                <tr>
                  <td style="padding: 48px 40px; background: #ffffff">
                    <table
                      role="presentation"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                    >
                      <tr>
                        <td>
                          <p class="greeting">{{greeting}} {{userName}},</p>
                        </td>
                      </tr>

                      {{{content}}}

                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer Section - Outside main container -->
              <table
                align="center"
                role="presentation"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="600"
                style="max-width: 600px; margin-top: 40px"
              >
                <tr>
                  <td align="center" style="padding: 32px 40px; text-align: center">
                    <table
                      role="presentation"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                    >
                      <tr>
                        <td align="center">
                          <p class="support-text">
                            Having any troubles? Our 24/7 support team is here to
                            help.<br />
                            Contact us at
                            <a href="mailto:support@zerocard.xyz"
                              >support@zerocard.xyz</a
                            >
                          </p>

                          <div class="social-icons" style="margin-top: 32px">
                            <a href="https://www.linkedin.com/company/itanaafrica/">
                              <img
                                src="https://itana-public.s3.eu-west-2.amazonaws.com/images/linkedin.png"
                                alt="LinkedIn"
                              />
                            </a>
                            <a
                              href="https://www.instagram.com/itanaafrica?igsh=MWIydmY4MG1uYWNueg=="
                            >
                              <img
                                src="https://itana-public.s3.eu-west-2.amazonaws.com/images/instagram.png"
                                alt="Instagram"
                              />
                            </a>
                            <a href="https://twitter.com/ItanaAfrica">
                              <img
                                src="https://itana-public.s3.eu-west-2.amazonaws.com/images/twitter.png"
                                alt="Twitter"
                              />
                            </a>
                          </div>

                          <p class="copyright">
                            &copy; {{currentYear}} zerocard. All rights
                            reserved.<br />
                            <a href="https://getzerocard.xyz/privacy-policy">Privacy Policy</a> •
                            <a href="https://getzerocard.xyz/terms-of-service">Terms of Service</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
};
