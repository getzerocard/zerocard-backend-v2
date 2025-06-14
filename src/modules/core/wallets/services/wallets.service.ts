import { WalletsInfrastructureService } from '@/modules/infrastructure/wallet/services';
import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { UserEntity } from '@/shared';

@Injectable()
export class WalletsService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly database: PrismaService,
    private readonly walletsInfrastructureService: WalletsInfrastructureService,
  ) {
    this.logger.setContext(WalletsService.name);
  }

  async createWalletAddresses(user: UserEntity) {
    if (user.walletsGenerated()) return;

    return await this.walletsInfrastructureService.createWalletAddresses(user.id);
  }

  async getWallets(userId: string) {
    const wallets = await this.database.wallet.findMany({
      where: {
        ownerId: userId,
        isActive: true,
      },
    });

    return wallets;
  }
}
