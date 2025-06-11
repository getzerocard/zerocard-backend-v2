import { SEND_SIGN_IN_OTP } from '@/shared';
import { Event } from '../interfaces';

export class SendSignInOtpEvent implements Event {
  readonly eventName = SEND_SIGN_IN_OTP;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly otp: string,
    public readonly loginTime: string,
    public readonly loginLocation: string,
    public readonly loginIP: string,
    public readonly userName?: string,
  ) {}
}

export const SignInEvents = [SendSignInOtpEvent];
