import { NotificationChannel, NotificationPriority, SEND_SIGN_IN_OTP } from '@/shared';
import { NotificationQueue } from '@/modules/infrastructure/workers/queues';
import { SendSignInOtpEvent } from '@/modules/infrastructure/events';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SignInEventsHandler {
  constructor(
    private readonly notificationQueue: NotificationQueue,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SignInEventsHandler.name);
  }

  @OnEvent(SEND_SIGN_IN_OTP)
  async handleSendSignInOtp(event: SendSignInOtpEvent) {
    this.logger.info(`Handling send.signin.otp event for user ${event.aggregateId}`);

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
