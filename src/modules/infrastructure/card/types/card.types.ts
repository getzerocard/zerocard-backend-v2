export interface CreateCardParams {
  customerId: string;
  type: 'virtual' | 'physical';
  currency: 'ngn' | 'usd';
  status: 'active' | 'inactive';
  fundingSourceId: string;
  number: string;
  issuerCountry: 'NGA' | 'USA';
  sendPINSMS: boolean;
  expirationDate: string;
}
