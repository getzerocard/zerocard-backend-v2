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
    private readonly logger: PinoLogger,
    private readonly blockradarProvider: BlockradarProvider,
    private readonly systemWalletService: SystemWalletService,
  ) {
    this.logger.setContext(BlockradarService.name);
  }

  async createWalletAddresses(ownerId: string): Promise<WalletAddress[]> {
    const wallets = await this.systemWalletService.getWallets();
    const addresses: WalletAddress[] = [];

    for (const wallet of wallets) {
      const response = await this.blockradarProvider.createWalletAddress({
        ...wallet,
        ownerId: `zrcrd:${ownerId}`, // add zrcrd as a prefix, just for fancy, depicts zerocard
      });
      const data = response.data;
      addresses.push({
        id: data.id,
        address: data.address,
        chain: data.blockchain.name,
      });
    }

    return addresses;
  }
}
