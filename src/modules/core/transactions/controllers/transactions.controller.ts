import { UserEntity } from '@/shared';
import { TransactionsService } from '../services';
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Req() req: Request) {
    const user = req.user as UserEntity;
    // const transactions = await this.transactionsService.getTransactions(user.id);
    // return transactions;
  }
}
