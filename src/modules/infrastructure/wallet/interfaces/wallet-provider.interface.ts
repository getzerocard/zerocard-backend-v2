export interface WalletProvider {
  createWallet(userId: string): Promise<string>;
  getBalance(walletId: string): Promise<number>;
}
