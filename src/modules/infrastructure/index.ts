import { EventBusModule } from './events';
import { NotificationModule } from './notification';
import { SchedulerModule } from './scheduler';
import { WorkersModule } from './workers';

export const INFRASTRUCTURE_MODULES = [
  EventBusModule,
  NotificationModule,
  SchedulerModule,
  WorkersModule,
];
