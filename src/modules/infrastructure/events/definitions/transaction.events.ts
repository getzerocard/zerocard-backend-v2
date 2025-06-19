import { TOKEN_DEPOSITED } from '@/shared';

export class TokenDepositedEvent {
  readonly eventName = TOKEN_DEPOSITED;

  constructor(
    public readonly walletId: string,
    public readonly addressId: string,
    public readonly fromAssetId: string,
    
    public readonly amount: number,
    public readonly refrence: string,
    public readonly metadata: string,
    public readonly recipientAddress: string,
    public readonly asset: string,
    public readonly aggregateId: string,
  ) {}
}

export const TransactionEvents = [TokenDepositedEvent];
