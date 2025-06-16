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

  getBalances(): Record<string, number> {
    const tokenSums: Record<string, number> = {};
    for (const balance of this.balances) {
      const symbol = balance.token.symbol;
      const amount = Number(balance.balance);
      tokenSums[symbol] = (tokenSums[symbol] || 0) + amount;
    }
    return tokenSums;
  }

  getWalletDetails() {
    return {
      address: this.address,
      chain: this.chain,
      balances: this.getBalances(),
    };
  }
}
