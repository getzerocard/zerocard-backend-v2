import { CardOrderCreatedEvent, EventBusService } from '@/modules/infrastructure/events';
import { SystemConfigService } from '@/modules/infrastructure/system-config';
import { WalletsService } from '@/modules/core/wallets/services';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SYSTEM_CONFIG_KEYS, UserEntity, Util } from '@/shared';
import { PrismaService } from '@/infrastructure';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CardOrderService {
  constructor(
    private readonly database: PrismaService,
    private readonly logger: PinoLogger,
    private readonly walletsService: WalletsService,
    private readonly systemConfigService: SystemConfigService,
    private readonly eventBus: EventBusService,
  ) {}

  async orderCard(user: UserEntity) {
    const cardOrderAmount = Number(
      this.systemConfigService.get(SYSTEM_CONFIG_KEYS.CARD_ORDER_AMOUNT),
    );

    if (!cardOrderAmount) {
      this.logger.error('Card order amount is not set');
      throw new BadRequestException(
        'You cannot order a card at the moment, please try again later.',
      );
    }

    const allocations = await this.walletsService.getWalletAllocationsForAmount(
      user.getId(),
      cardOrderAmount,
      `Please fund your wallet with a minimum of ${cardOrderAmount} USDT or USDC to order a card`,
    );

    const cardOrder = await this.database.$transaction(async tx => {
      const reference = Util.generateUlid('co').toLowerCase(); // co = card order
      const cardOrder = await this.database.cardOrder.create({
        data: {
          user: { connect: { id: user.getId() } },
        },
      });

      await tx.transaction.create({
        data: {
          reference,
          user: { connect: { id: user.getId() } },
          category: 'CARD_ORDER',
          status: 'COMPLETED',
          description: 'Card order',
          completedAt: new Date(),
          entries: {
            createMany: {
              data: allocations.map(allocation => ({
                walletId: allocation.id,
                entryType: 'DEBIT',
                asset: allocation.token,
                amount: allocation.amount,
                memo: 'Card order',
              })),
            },
          },
        },
      });

      for (const allocation of allocations) {
        await tx.walletTokenBalance.update({
          where: {
            id: allocation.balanceId,
          },
          data: {
            availableBalance: {
              decrement: allocation.amount,
            },
          },
        });
      }

      return cardOrder;
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
