import { TransactionEntry } from '@prisma/client';

export class TransactionEntryEntity {
  constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly entryType: string,
    public readonly asset: string,
    public readonly amount: number,
    public readonly memo: string,
  ) {}

  static fromRawData(transaction: TransactionEntry): TransactionEntryEntity {
    return new TransactionEntryEntity(
      transaction.id,
      transaction.walletId,
      transaction.entryType,
      transaction.asset,
      transaction.amount.toNumber(),
      transaction.memo,
    );
  }
}
