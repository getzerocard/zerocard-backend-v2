import { SignInEvents } from './signin.events';
import { MfaEvents } from './mfa.events';

export const EventDefinitions = [...SignInEvents, ...MfaEvents];

export * from './signin.events';
export * from './mfa.events';
