import { AppHealthModule } from './app-health';
import { CardInfrastructureModule } from './card';
import { EventBusModule } from './events';
import { KycInfrastructureModule } from './kyc';
import { NotificationModule } from './notification';
import { SchedulerModule } from './scheduler';
import { WalletInfrastructureModule } from './wallet';
import { WorkersModule } from './workers';

export const INFRASTRUCTURE_MODULES = [
  AppHealthModule,
  CardInfrastructureModule,
  EventBusModule,
  KycInfrastructureModule,
  NotificationModule,
  SchedulerModule,
  WalletInfrastructureModule,
  WorkersModule,
];
