import { AuthModule } from './auth';
import { CardsModule } from './cards';
import { TransactionsModule } from './transactions';
import { UsersModule } from './users';
import { WalletsModule } from './wallets';

export const CORE_MODULES = [
  AuthModule,
  CardsModule,
  TransactionsModule,
  UsersModule,
  WalletsModule,
];
