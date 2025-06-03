import { AuthModule } from './auth';
import { CardsModule } from './cards';
import { EventBusModule } from './events';
import { NotificationModule } from './notification';
import { SchedulerModule } from './scheduler';
import { TransactionsModule } from './transactions';
import { UsersModule } from './users';
import { WalletModule } from './wallet';
import { WorkersModule } from './workers';

export const MODULES = [
  CardsModule,
  EventBusModule,
  NotificationModule,
  AuthModule,
  SchedulerModule,
  TransactionsModule,
  UsersModule,
  WalletModule,
  WorkersModule,
];
