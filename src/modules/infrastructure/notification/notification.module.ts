import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './services/notification.service';
import { SesProvider } from './providers';
import { EmailService } from './services';
import { EmailTemplateRendererService } from './providers';
import { NOTIFICATION_QUEUE } from '@/shared/constants';
import { NotificationQueue } from '@/modules/workers/queues';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [
    NotificationService,
    SesProvider,
    NotificationQueue,
    EmailService,
    EmailTemplateRendererService,
  ],
  exports: [NotificationService, NotificationQueue],
})
export class NotificationModule {}
