import { SystemConfigService } from '@/modules/infrastructure/system-config';
import { CardOrderCreatedEvent, EventBusService } from '@/modules/infrastructure/events';
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
    private readonly eventBus: EventBusService,
  ) {}

  async orderCard(user: UserEntity) {
    const totalBalance = await this.walletsService.getTotalAvailableBalance(user.getId());

    const cardOrderAmount = Number(
      this.systemConfigService.get(SYSTEM_CONFIG_KEYS.CARD_ORDER_AMOUNT),
    );

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

    const address = user.getAddress();

    this.eventBus.publish(
      new CardOrderCreatedEvent(user.getId(), user.getEmail(), user.getFirstName(), {
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
      }),
    );
    return {
      status: cardOrder.status,
      createdAt: cardOrder.createdAt,
      updatedAt: cardOrder.updatedAt,
      fulfilledAt: cardOrder.fulfilledAt,
    };
  }
}
