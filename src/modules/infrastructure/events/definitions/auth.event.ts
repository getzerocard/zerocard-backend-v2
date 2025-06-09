import { Event } from '../interfaces';
import { ACCOUNT_CREATED } from '@/shared';

export class AccountCreatedEvent implements Event {
  readonly eventName = ACCOUNT_CREATED;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly userName: string,
    public readonly verificationCode: string,
  ) {}
}

export const AuthEventDefinitions = [AccountCreatedEvent];
