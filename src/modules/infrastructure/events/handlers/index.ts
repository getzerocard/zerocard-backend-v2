import { MfaEventsHandler } from './mfa-events.handler';
import { SignInEventsHandler } from './signin-events.handler';
import { UserEventsHandler } from './user-events.handler';

export const DefinitionHandlers = [MfaEventsHandler, SignInEventsHandler, UserEventsHandler];
