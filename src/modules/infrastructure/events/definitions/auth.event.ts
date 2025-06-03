import { Event } from '../interfaces';
import {
  ACCOUNT_BLOCKED,
  ACCOUNT_CREATED,
  ACCOUNT_VERIFIED,
  USER_FORGOT_PASSWORD,
} from '@/shared';

export class AccountCreatedEvent implements Event {
  readonly eventName = ACCOUNT_CREATED;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly userName: string,
    public readonly verificationCode: string,
  ) {}
}

export class AccountVerifiedEvent implements Event {
  readonly eventName = ACCOUNT_VERIFIED;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly userName: string,
  ) {}
}

export class AccountBlockedEvent implements Event {
  readonly eventName = ACCOUNT_BLOCKED;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly userName: string,
  ) {}
}

export class UserForgotPasswordEvent implements Event {
  readonly eventName = USER_FORGOT_PASSWORD;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly userName: string,
    public readonly resetCode: string,
  ) {}
}

export const AuthEventDefinitions = [
  AccountCreatedEvent,
  AccountVerifiedEvent,
  AccountBlockedEvent,
  UserForgotPasswordEvent,
];
