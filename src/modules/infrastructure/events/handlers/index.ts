import { CardEventsHandler } from './card-events.handler';
import { MfaEventsHandler } from './mfa-events.handler';
import { SignInEventsHandler } from './signin-events.handler';
import { UserEventsHandler } from './user-events.handler';

export const DefinitionHandlers = [
  CardEventsHandler,
  MfaEventsHandler,
  SignInEventsHandler,
  UserEventsHandler,
];
