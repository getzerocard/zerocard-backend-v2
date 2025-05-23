import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalService } from './cryptoWithdrawal.service';
import { BalanceService } from './balance.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entity/user.entity';
import { FundsLock } from '../Card/entity/fundsLock.entity';
import { Withdrawal } from './entity/withdrawal.entity';
import { Transaction } from '../Transaction/entity/transaction.entity';
import { FiatWithdrawalService } from './fiatwithdrwal.service';
import { OfframpModule } from '../offramp/offramp.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, FundsLock, Withdrawal, Transaction]),
    OfframpModule,
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService, BalanceService, FiatWithdrawalService],
  exports: [WithdrawalService, BalanceService, FiatWithdrawalService],
})
export class WithdrawalModule { }
