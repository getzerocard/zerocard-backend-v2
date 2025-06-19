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

  getBalances(): Record<string, { id: string; ledgerBalance: number; availableBalance: number }> {
    const tokenSums: Record<
      string,
      { id: string; ledgerBalance: number; availableBalance: number }
    > = {};
    for (const balance of this.balances) {
      const symbol = balance.token.symbol;
      const ledgerBalance = Number(balance.ledgerBalance);
      const availableBalance = Number(balance.availableBalance);
      tokenSums[symbol] = {
        id: balance.id,
        ledgerBalance: ledgerBalance,
        availableBalance: availableBalance,
      };
    }
    return tokenSums;
  }

  getWalletDetails() {
    return {
      id: this.id,
      address: this.address,
      chain: this.chain,
      balances: this.getBalances(),
    };
  }
}
