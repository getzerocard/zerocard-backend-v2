import { BlockradarService } from './blockradar.service';
import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class WalletsInfrastructureService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly database: PrismaService,
    private readonly blockradarService: BlockradarService,
  ) {
    this.logger.setContext(WalletsInfrastructureService.name);
  }

  async createWalletAddresses(userId: string) {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`User ${userId} not found`);
      return;
    }

    const addresses = await this.blockradarService.createWalletAddresses(user.id);

    this.logger.info(`Created ${addresses.length} wallet addresses for user ${user.id}`);

    await this.database.$transaction(async tx => {
      await this.database.user.update({
        where: { id: user.id },
        data: {
          walletsGeneratedAt: new Date(),
          wallets: {
            createMany: {
              data: addresses.map(address => ({
                identifier: `${user.uniqueName}_${address.chain}_wallet`,
                name: `${user.uniqueName} ${address.chain} Wallet`,
                address: address.address,
                providerWalletId: address.id,
                chain: address.chain,
              })),
            },
          },
        },
      });
    });
  }
}
