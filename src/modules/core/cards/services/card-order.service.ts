import { SystemConfigService } from '@/modules/infrastructure/system-config';
import { WalletsService } from '@/modules/core/wallets/services';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SYSTEM_CONFIG_KEYS, UserEntity } from '@/shared';
import { PrismaService } from '@/infrastructure';

@Injectable()
export class CardOrderService {
  constructor(
    private readonly database: PrismaService,
    private readonly walletsService: WalletsService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async orderCard(user: UserEntity) {
    const totalBalance = await this.walletsService.getTotalAvailableBalance(user.getId());

    const cardOrderAmount = this.systemConfigService.get(SYSTEM_CONFIG_KEYS.CARD_ORDER_AMOUNT);

    if (totalBalance < cardOrderAmount) {
      throw new BadRequestException(
        `Please fund your wallet with a minimum of ${cardOrderAmount} USDT or USDC to order a card`,
      );
    }

    const cardOrder = await this.database.cardOrder.create({
      data: {
        user: { connect: { id: user.getId() } },
      },
    });

    // TODO: Send email to user
    return {
      status: cardOrder.status,
      createdAt: cardOrder.createdAt,
      updatedAt: cardOrder.updatedAt,
      fulfilledAt: cardOrder.fulfilledAt,
    };
  }
}
