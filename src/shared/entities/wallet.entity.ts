import { Wallet, WalletChain, WalletTokenBalance } from '@prisma/client';

type WalletTokenBalanceWithToken = WalletTokenBalance & {
  token: {
    symbol: string;
  };
};

export class WalletEntity {
  constructor(
    public readonly id: string,
    public readonly address: string,
    public readonly chain: WalletChain,
    public readonly balances: WalletTokenBalanceWithToken[],
  ) {}

  static fromRawData(wallet: Wallet & { balances: WalletTokenBalanceWithToken[] }): WalletEntity {
    return new WalletEntity(wallet.id, wallet.address, wallet.chain, wallet.balances);
  }

  getChain(): WalletChain {
    return this.chain;
  }

  getAddress(): string {
    return this.address;
  }

  getWalletDetails() {
    return {
      address: this.address,
      chain: this.chain,
      balances: this.balances.map(balance => ({
        token: balance.token.symbol,
        balance: Number(balance.balance),
      })),
    };
  }
}
