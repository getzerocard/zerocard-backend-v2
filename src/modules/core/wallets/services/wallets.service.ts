import { WalletsInfrastructureService } from '@/modules/infrastructure/wallet/services';
import { UserEntity, WalletEntity } from '@/shared';
import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class WalletsService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly database: PrismaService,
    private readonly walletsInfraService: WalletsInfrastructureService,
  ) {
    this.logger.setContext(WalletsService.name);
  }

  async createWalletAddresses(user: UserEntity) {
    if (user.walletsGenerated()) return this.getWallets(user.id);

    return await this.walletsInfraService.createWalletAddresses(user.id);
  }

  async getWallets(userId: string) {
    const wallets = await this.database.wallet.findMany({
      where: {
        ownerId: userId,
        isActive: true,
      },
      include: {
        balances: {
          include: {
            token: true,
          },
        },
      },
    });

    return wallets.map(wallet => WalletEntity.fromRawData(wallet).getWalletDetails());
  }
}
