export interface WalletProvider {
  createWalletAddress(userId: string): Promise<string>;
  getBalance(walletId: string): Promise<number>;
}
