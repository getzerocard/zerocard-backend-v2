import {
  AccountCreatedEvent,
  AccountVerifiedEvent,
  UserForgotPasswordEvent,
  AccountBlockedEvent,
} from '@/modules/events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { NotificationQueue } from '@/modules/workers/queues';
import {
  ACCOUNT_CREATED,
  ACCOUNT_VERIFIED,
  NotificationChannel,
  NotificationPriority,
  USER_FORGOT_PASSWORD,
} from '@/shared';

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
    this.logger.info(
      `Handling account.created event for user ${event.aggregateId}`,
    );

    await this.notificationQueue.addNotification({
      recipient: event.email,
      options: {
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
      },
      event,
    });
  }

  @OnEvent(ACCOUNT_VERIFIED)
  async handleAccountVerified(event: AccountVerifiedEvent) {
    this.logger.info(
      `Handling account.verified event for user ${event.aggregateId}`,
    );

    await this.notificationQueue.addNotification({
      recipient: event.email,
      options: {
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
      },
      event,
    });
  }

  @OnEvent(USER_FORGOT_PASSWORD)
  async handleUserForgotPassword(event: UserForgotPasswordEvent) {
    this.logger.info(
      `Handling account.user.password.reset.requested event for user ${event.aggregateId}`,
    );

    await this.notificationQueue.addNotification({
      recipient: event.email,
      options: {
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
      },
      event,
    });
  }

  @OnEvent('account.blocked')
  async handleAccountBlocked(event: AccountBlockedEvent) {
    this.logger.info(
      `Handling account.blocked event for user ${event.aggregateId}`,
    );

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
