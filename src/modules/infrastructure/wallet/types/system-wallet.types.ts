export interface CreateWalletAddressParams {
  walletId: string;
  apiKey: string;
  address: string;
  ownerId: string;
}

export interface GetSwapQuoteParams {
  walletId: string;
  apiKey: string;
  addressId: string;
  fromAssetID: string;
  toAssetId: string;
  recipientAddress: string;
  amount: number;
}

export interface ExecuteSwapParams {
  walletId: string;
  apiKey: string;
  addressId: string;
  fromAssetID: string;
  recipientAddress: string;
  toAssetId: string;
  amount: number;
  refrence: string;
  metadata: string;
}

export interface handleSwap {
  walletId: string;
  addressId: string;
  fromAssetID: string;
  amount: number;
  refrence: string;
  metadata: string;
  recipientAddress: string;
  asset: string;
}
