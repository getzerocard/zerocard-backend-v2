import { SystemWalletService } from '@/modules/core/system';
import { BlockradarProvider } from '../providers';
import { WalletChain } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

interface WalletAddress {
  id: string;
  address: string;
  chain: WalletChain;
}

@Injectable()
export class BlockradarService {
  constructor(
    private readonly blockradarProvider: BlockradarProvider,
    private readonly systemWalletService: SystemWalletService,
    private readonly logger: PinoLogger,
  ) {}

  async createWalletAddresses(ownerId: string): Promise<WalletAddress[]> {
    try {
      const wallets = await this.systemWalletService.getWallets();

      const addresses: WalletAddress[] = [];
      for (const wallet of wallets) {
        const response = await this.blockradarProvider.createWalletAddress(wallet.walletId);
        addresses.push({
          id: response.id,
          address: response.address,
          chain: response.blockchain.name,
        });
      }

      return addresses;
    } catch (error) {
      this.logger.error(
        `Failed to create wallet addresses on blockradar for user ${ownerId}`,
        { error },
        error,
      );
      throw new Error('Failed to create wallet addresses on blockradar');
    }
  }
}
