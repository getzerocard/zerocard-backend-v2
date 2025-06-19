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

  getBalances(): {
    id: string;
    token: string;
    ledgerBalance: number;
    availableBalance: number;
  }[] {
    const balancesArray = [];

    for (const balance of this.balances) {
      balancesArray.push({
        id: balance.id,
        token: balance.token.symbol,
        ledgerBalance: Number(balance.ledgerBalance),
        availableBalance: Number(balance.availableBalance),
      });
    }

    return balancesArray;
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
