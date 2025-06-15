import { AuthModule } from './auth';
import { CardsModule } from './cards';
import { KycModule } from './kyc';
import { MfaModule } from './mfa';
import { TransactionsModule } from './transactions';
import { UsersModule } from './users';
import { WalletsModule } from './wallets';
import { SystemModule } from './system';

export const CORE_MODULES = [
  AuthModule,
  CardsModule,
  KycModule,
  TransactionsModule,
  UsersModule,
  WalletsModule,
  MfaModule,
  SystemModule,
];
