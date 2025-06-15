import { SignInEvents } from './signin.events';
import { MfaEvents } from './mfa.events';
import { UserEvents } from './user.event';

export const EventDefinitions = [...SignInEvents, ...MfaEvents, ...UserEvents];

export * from './signin.events';
export * from './mfa.events';
export * from './user.event';
