import { PrismaService } from '@/infrastructure';
import { GetTransactionsDto } from '../dtos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  constructor(private readonly database: PrismaService) {}

  async getTransactions(userId: string, params: GetTransactionsDto) {
    const { page, take, skip } = params;

    const transactions = await this.database.transaction.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        entries: true,
      },
    });
  }
}
