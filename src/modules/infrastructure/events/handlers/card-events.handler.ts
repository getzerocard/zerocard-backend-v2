import { CARD_ORDER_CREATED, NotificationChannel, NotificationPriority } from '@/shared';
import { NotificationQueue } from '@/modules/infrastructure/workers/queues';
import { CardOrderCreatedEvent } from '@/modules/infrastructure/events';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CardEventsHandler {
  constructor(
    private readonly notificationQueue: NotificationQueue,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CardEventsHandler.name);
  }

  @OnEvent(CARD_ORDER_CREATED)
  async handleCardOrderCreated(event: CardOrderCreatedEvent) {
    this.logger.info(`Handling card.order.created event for user ${event.aggregateId}`);

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
