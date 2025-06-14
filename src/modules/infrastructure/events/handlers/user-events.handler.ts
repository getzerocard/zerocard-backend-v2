import { WalletsInfrastructureService } from '@/modules/infrastructure/wallet';
import { UserCreatedEvent } from '@/modules/infrastructure/events';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { USER_CREATED } from '@/shared';

@Injectable()
export class UserEventsHandler {
  constructor(
    private readonly logger: PinoLogger,
    private readonly walletService: WalletsInfrastructureService,
  ) {
    this.logger.setContext(UserEventsHandler.name);
  }

  @OnEvent(USER_CREATED)
  async handleUserCreated(event: UserCreatedEvent) {
    this.logger.info(`Handling user.created event for user ${event.aggregateId}`);
    await this.walletService.createWalletAddresses(event.aggregateId);
  }
}
