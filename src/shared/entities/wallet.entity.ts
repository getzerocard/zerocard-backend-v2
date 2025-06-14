import { Wallet } from '@prisma/client';

export class WalletEntity {
  constructor(
    public readonly id: string,
    public readonly address: string,
    public readonly chain: string,
    public readonly balance: number,
  ) {}

  static fromRawData(wallet: Wallet): WalletEntity {
    return new WalletEntity(wallet.id, wallet.address, wallet.chain, wallet.balance.toNumber());
  }

  getBalance(): number {
    return this.balance;
  }

  getChain(): string {
    return this.chain;
  }

  getAddress(): string {
    return this.address;
  }

  getWalletDetails() {
    return {
      address: this.address,
      chain: this.chain,
      balance: this.balance,
    };
  }
}
