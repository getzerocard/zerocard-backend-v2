import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure';

@Injectable()
export class WalletRepository {
  constructor(private readonly database: PrismaService) { }
}
