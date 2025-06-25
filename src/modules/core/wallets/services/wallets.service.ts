import { WalletsInfrastructureService } from '@/modules/infrastructure/wallet';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RatesService } from '@/modules/infrastructure/rates';
import { PrismaService } from '@/infrastructure';
import { PinoLogger } from 'nestjs-pino';
import { UserEntity } from '@/shared';

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
    private readonly rateService: RatesService,
  ) {
    this.logger.setContext(WalletsService.name);
  }

  async createWalletAddresses(user: UserEntity) {
    if (user.walletsGenerated()) return this.getWallets(user.id);

    return await this.walletsInfraService.createWalletAddresses(user.id);
  }

  async getWallets(userId: string) {
    return await this.database.wallet.findMany({
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
        if ((balance?.availableBalance?.toNumber() || 0) > 0) {
          balances.push({
            id: wallet.id,
            balanceId: balance.id,
            token,
            address: wallet.address,
            amount: balance.availableBalance.toNumber(),
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

  async getTotalBalance(userId: string) {
    this.logger.info(`Getting total balance for user: ${userId}`);
    const wallets = await this.getWallets(userId);

    if (!wallets || wallets.length === 0) {
      this.logger.error(`Wallet not found: ${userId}`);
      return;
    }

    // Get balances from all wallets
    const allBalances = wallets.flatMap(wallet => wallet.balances);

    const rates = await Promise.all(
      allBalances.map(async balance => {
        const rate = await this.rateService.getRates(balance.token.symbol);
        return { token: balance.token, rate };
      }),
    );

    let totalValueInNaira = 0;

    for (const balance of allBalances) {
      const rateEntry = rates.find(r => r.token.symbol === balance.token.symbol);

      if (!rateEntry || rateEntry.rate.status !== 'success') continue;

      const rate = parseFloat(rateEntry.rate.data);
      const balanceValue = balance.availableBalance.toNumber() * rate;

      totalValueInNaira += balanceValue;
    }

    return totalValueInNaira;
  }
}
