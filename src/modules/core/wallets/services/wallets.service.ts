import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class WalletsService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly database: PrismaService,
  ) {
    this.logger.setContext(WalletsService.name);
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
