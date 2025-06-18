import { WalletsInfrastructureService } from '@/modules/infrastructure/wallet';
import { SystemConfigService } from '@/modules/infrastructure/system-config';
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
    private readonly systemConfigService: SystemConfigService,
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

  async getTotalAvailableBalance(userId: string): Promise<number> {
    const wallets = await this.getWallets(userId);

    const totalUsdtAvailableBalance = wallets.reduce((total, wallet) => {
      return total + (wallet.balances.usdt?.availableBalance || 0);
    }, 0);

    const totalUsdcAvailableBalance = wallets.reduce((total, wallet) => {
      return total + (wallet.balances.usdc?.availableBalance || 0);
    }, 0);

    return totalUsdtAvailableBalance + totalUsdcAvailableBalance;
  }
}
