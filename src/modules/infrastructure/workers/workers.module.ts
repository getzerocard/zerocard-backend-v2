import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DomainQueues } from './queues';
import { DomainProcessors } from './processors';
import { QUEUES } from '@/shared';
import { NotificationModule } from '@/modules/infrastructure/notification';
const bullQueues = Object.values(QUEUES).map(name => ({ name }));

@Module({
  imports: [NotificationModule, ...bullQueues.map(queue => BullModule.registerQueue(queue))],
  providers: [...DomainQueues, ...DomainProcessors],
})
export class WorkersModule {}
