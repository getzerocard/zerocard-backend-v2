export interface EmailTemplateData {
  header: string;
  greeting: string;
  userName: string;
  closingMessage: string;
  signature: string;
  [key: string]: any;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}
