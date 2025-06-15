import { BlockradarService } from './blockradar.service';
import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { WalletEntity } from '@/shared';
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

    const tokens = await this.database.token.findMany({
      where: {
        chain: {
          in: addresses.map(address => address.chain),
        },
      },
    });

    const wallets = await this.database.$transaction(async tx => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          walletsGeneratedAt: new Date(),
        },
      });

      const wallets = [];

      for (const address of addresses) {
        const wallet = await tx.wallet.create({
          data: {
            owner: { connect: { id: user.id } },
            identifier: `${address.chain}_wallet`,
            name: `${address.chain} Wallet`,
            address: address.address,
            providerWalletId: address.id,
            chain: address.chain,
            balances: {
              createMany: {
                data: tokens.map(token => ({
                  tokenId: token.id,
                })),
              },
            },
          },
          include: { balances: { include: { token: true } } },
        });

        wallets.push(wallet);
      }

      return wallets.map(wallet => WalletEntity.fromRawData(wallet).getWalletDetails());
    });

    return wallets;
  }
}
