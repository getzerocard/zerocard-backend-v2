import { Send2FATokenEvent } from '@/modules/infrastructure/events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { NotificationQueue } from '@/modules/infrastructure/workers/queues';
import { NotificationChannel, NotificationPriority, SEND_2FA_OTP } from '@/shared';

@Injectable()
export class MfaEventsHandler {
  constructor(
    private readonly notificationQueue: NotificationQueue,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(MfaEventsHandler.name);
  }

  @OnEvent(SEND_2FA_OTP)
  async handleSend2FaOtp(event: Send2FATokenEvent) {
    this.logger.info(`Handling send.2fa.mfa.token event for user ${event.aggregateId}`);

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
