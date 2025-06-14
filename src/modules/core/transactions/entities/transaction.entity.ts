import { Transaction, TransactionEntry } from '@prisma/client';
import { TransactionEntryEntity } from './transaction-entry.entity';

export class TransactionEntity {
  constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly category: string,
    public readonly status: string,
    public readonly description: string,
    public readonly createdAt: Date,
    public readonly completedAt: Date,
    public readonly entries: TransactionEntryEntity[],
  ) {}

  static fromRawData(
    transaction: Transaction & { entries: TransactionEntry[] },
  ): TransactionEntity {
    return new TransactionEntity(
      transaction.id,
      transaction.reference,
      transaction.category,
      transaction.status,
      transaction.description,
      transaction.createdAt,
      transaction.completedAt,
      transaction.entries.map(entry => TransactionEntryEntity.fromRawData(entry)),
    );
  }
}
