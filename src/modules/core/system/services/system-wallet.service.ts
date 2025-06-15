import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemWalletService {
  constructor(private readonly database: PrismaService) {}

  async getWallets(isActive: boolean = true) {
    return this.database.systemWallet.findMany({
      where: { isActive },
    });
  }

  async getWalletByProviderWalletId(walletId: string) {
    return this.database.systemWallet.findUnique({
      where: { walletId },
    });
  }

  async getWalletById(id: string) {
    return this.database.systemWallet.findUnique({
      where: { id },
    });
  }
}
