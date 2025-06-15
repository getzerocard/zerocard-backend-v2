import { SignInEvents } from './signin.events';
import { MfaEvents } from './mfa.events';
import { UserEvents } from './user.event';
import { CardEvents } from './card.events';

export const EventDefinitions = [...SignInEvents, ...MfaEvents, ...UserEvents, ...CardEvents];

export * from './signin.events';
export * from './mfa.events';
export * from './user.event';
export * from './card.events';
