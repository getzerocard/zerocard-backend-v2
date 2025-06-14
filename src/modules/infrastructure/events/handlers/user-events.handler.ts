import { BlockradarService } from '@/modules/infrastructure/wallet';
import { UserCreatedEvent } from '@/modules/infrastructure/events';
import { PrismaService } from '@/infrastructure';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { USER_CREATED } from '@/shared';

@Injectable()
export class UserEventsHandler {
  constructor(
    private readonly logger: PinoLogger,
    private readonly blockradarService: BlockradarService,
    private readonly database: PrismaService,
  ) {
    this.logger.setContext(UserEventsHandler.name);
  }

  @OnEvent(USER_CREATED)
  async handleUserCreated(event: UserCreatedEvent) {
    this.logger.info(`Handling user.created event for user ${event.aggregateId}`);

    // try {
    const addresses = await this.blockradarService.createWalletAddresses(event.aggregateId);

    this.logger.info(`Created ${addresses.length} wallet addresses for user ${event.aggregateId}`);

    await this.database.$transaction(async tx => {
      await this.database.user.update({
        where: { id: event.aggregateId },
        data: {
          walletsGeneratedAt: new Date(),
          wallets: {
            createMany: {
              data: addresses.map(address => ({
                identifier: `${event.userName}_${address.chain}_wallet`,
                name: `${event.userName} ${address.chain} Wallet`,
                address: address.address,
                providerWalletId: address.id,
                chain: address.chain,
              })),
            },
          },
        },
      });
    });
    // } catch (error) {
    //   this.logger.error(`Error creating wallet addresses for user ${event.aggregateId}`, error);
    //   throw error;
    // }
  }
}
