import { WalletsInfrastructureService } from '@/modules/infrastructure/wallet';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity, WalletEntity } from '@/shared';
import { PrismaService } from '@/infrastructure';
import { PinoLogger } from 'nestjs-pino';

interface AllocationResult {
  id: string;
  balanceId: string;
  token: string;
  address: string;
  amount: number;
}

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

  /**
   * Calculates how to allocate a specific amount (e.g., 7 USDT) across a user's wallets,
   * using only the available balances from supported tokens (e.g., USDT, USDC).
   *
   * Behavior:
   * - Get all user's wallets.
   * - Extract balances for each token with `availableBalance > 0`.
   * - Sort these balances in ascending order (lowest first) — to drain small wallets before large ones.
   * - Iteratively deduct from these balances until the required amount is fully allocated.
   *
   * Why this is useful:
   * - We want to debit multiple wallets to fulfill a required charge (e.g., card ordering fee).
   * - We prefer not to drain high-balance wallets unless necessary.
   * - We need to know exactly how much to deduct from which wallets before executing the charge.
   *
   * Safety:
   * - Throws an error if the total available balance is insufficient
   *
   * Returns:
   * - An array of objects: `{ id, address, token, amount }` representing how to distribute the deduction.
   *
   * @param userId - the ID of the user whose wallets we want to allocate from
   * @param amount - the target amount to allocate
   * @returns an array of allocation instructions, or throws if the amount can't be fulfilled
   */

  async getWalletAllocationsForAmount(
    userId: string,
    amount: number,
    errorMsg?: string,
  ): Promise<AllocationResult[]> {
    const wallets = await this.getWallets(userId);

    const balances: AllocationResult[] = [];

    for (const wallet of wallets) {
      for (const [token, balance] of Object.entries(wallet.balances)) {
        if ((balance?.availableBalance || 0) > 0) {
          balances.push({
            id: wallet.id,
            balanceId: balance.id,
            token,
            address: wallet.address,
            amount: balance.availableBalance,
          });
        }
      }
    }

    balances.sort((a, b) => a.amount - b.amount);

    const result: AllocationResult[] = [];
    let remaining = amount;

    for (const b of balances) {
      if (remaining <= 0) break;

      const deductAmount = Math.min(remaining, b.amount);
      result.push({ ...b, amount: deductAmount });
      remaining -= deductAmount;
    }

    if (remaining > 0) {
      throw new BadRequestException(errorMsg || 'Insufficient balance to complete transaction');
    }

    return result;
  }
}
