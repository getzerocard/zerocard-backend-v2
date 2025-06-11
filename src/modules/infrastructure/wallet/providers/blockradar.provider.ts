import { WalletProvider } from '../interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockradarProvider implements WalletProvider {
  constructor() {}

  createWallet(userId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  getBalance(walletId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
