import { AuthEventDefinitions } from './auth.event';
import { MfaEvents } from './mfa.events';

export const EventDefinitions = [...AuthEventDefinitions, ...MfaEvents];

export * from './auth.event';
export * from './mfa.events';
