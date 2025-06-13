import { USER_CREATED } from '@/shared';
import { Event } from '../interfaces';

export class UserCreatedEvent implements Event {
  readonly eventName = USER_CREATED;

  constructor(
    public readonly aggregateId: string, // this is the user id
    public readonly email: string,
    public readonly userName: string,
  ) {}
}

export const UserEvents = [UserCreatedEvent];
