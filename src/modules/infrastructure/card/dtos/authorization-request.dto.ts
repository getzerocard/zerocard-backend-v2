export class AuthorizationRequestDto {
  _id: string;
  type: 'authorization.request';
  pendingWebhook: boolean;
  webhookArchived: boolean;
  environment: 'development' | 'production';
  business: string;
  data: {
    amount: number;
    fee: number;
    vat: number;
    approved: boolean;
    currency: string;
    status: 'pending' | 'approved' | 'declined';
    authorizationMethod: 'chip' | 'contactless' | 'magstripe';
    merchantAmount: number;
    merchantCurrency: string;
    customer: Record<string, any>;
    card: Record<string, any>;
    account: Record<string, any>;
    merchant: Record<string, any>;
    terminal: Record<string, any>;
    transactionMetadata: Record<string, any>;
    pendingRequest: Record<string, any>;
    verification: Record<string, any>;
    feeDetails: Record<string, any>;
  };
}
