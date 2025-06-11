import { SEND_2FA_OTP } from '@/shared';
import { Event } from '../interfaces';

export class Send2FATokenEvent implements Event {
  readonly eventName = SEND_2FA_OTP;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly otp: string,
    public readonly userName?: string,
  ) {}
}

export const MfaEvents = [Send2FATokenEvent];
