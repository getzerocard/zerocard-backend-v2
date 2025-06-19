import { CardEvents } from './card.events';
import { MfaEvents } from './mfa.events';
import { SignInEvents } from './signin.events';
import { UserEvents } from './user.event';

export const EventDefinitions = [...SignInEvents, ...MfaEvents, ...UserEvents, ...CardEvents];

export * from './signin.events';
export * from './mfa.events';
export * from './user.event';
export * from './card.events';
