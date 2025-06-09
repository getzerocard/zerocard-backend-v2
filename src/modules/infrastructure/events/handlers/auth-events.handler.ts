import { AccountCreatedEvent } from '@/modules/infrastructure/events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { NotificationQueue } from '@/modules/infrastructure/workers/queues';
import { ACCOUNT_CREATED, NotificationChannel, NotificationPriority } from '@/shared';

@Injectable()
export class AuthEventsHandler {
  constructor(
    private readonly notificationQueue: NotificationQueue,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthEventsHandler.name);
  }

  @OnEvent(ACCOUNT_CREATED)
  async handleAccountCreated(event: AccountCreatedEvent) {
    this.logger.info(`Handling account.created event for user ${event.aggregateId}`);

    await this.notificationQueue.addNotification({
      recipient: event.email,
      options: {
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
      },
      event,
    });
  }
}
