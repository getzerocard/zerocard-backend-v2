import { CreateWalletAddressParams } from '.';

export interface WalletProvider {
  createWalletAddress(wallet: CreateWalletAddressParams): Promise<any>;
  getBalance(walletId: string): Promise<number>;
}
