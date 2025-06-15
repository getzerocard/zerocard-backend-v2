import { CARD_ORDER_CREATED } from '@/shared';
import { Event } from '../interfaces';

export class CardOrderCreatedEvent implements Event {
  readonly eventName = CARD_ORDER_CREATED;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly userName: string,
  ) {}
}

export const CardEvents = [CardOrderCreatedEvent];
