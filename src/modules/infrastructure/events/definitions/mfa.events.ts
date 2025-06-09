import { SEND_2FA_MFA_TOKEN } from '@/shared';
import { Event } from '../interfaces';

export class Send2FAMfaTokenEvent implements Event {
  readonly eventName = SEND_2FA_MFA_TOKEN;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly otp: string,
    public readonly userName?: string,
  ) {}
}

export const MfaEvents = [Send2FAMfaTokenEvent];
