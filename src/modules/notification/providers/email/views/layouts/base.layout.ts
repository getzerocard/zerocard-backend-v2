import { EmailLayout } from '../interfaces';

export const baseLayout: EmailLayout = {
  name: 'base',
  html: `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="format-detection"
          content="telephone=no, date=no, address=no, email=no"
        />
        <title>Duerents</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
         <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #e50914;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #e50914;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
          }
          a.button {
            color: white !important;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #777;
          }
          .otp-box {
            font-family: 'Graphik', Arial, sans-serif;
            font-size: 32px;
            letter-spacing: 8px;
            color: #e50914;
            background: #f8fef7;
            border: 2px dashed #e50914;
            border-radius: 8px;
            padding: 24px 0;
            text-align: center;
            font-weight: 600;
            margin: 32px 0 24px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{header}}</h1>
          </div>
          <div class="content">
            <p>Hello {{name}},</p>
            {{{content}}}
            <p>Regards,<br />The Duerents Team</p>
          </div>
          <div class="footer">
            <p>&copy; {{currentYear}} Duerents. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};
