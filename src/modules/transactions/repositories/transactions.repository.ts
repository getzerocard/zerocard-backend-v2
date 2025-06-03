import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly database: PrismaService) { }

}
