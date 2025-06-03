import { Module } from '@nestjs/common';
import { TransactionsRepository } from './repositories';
import { TransactionsService } from './services';

@Module({
  providers: [TransactionsRepository, TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }
