import { DeviceInfo } from '@/shared';
import { TokenPair } from './token.types';
import { UserSession } from '@prisma/client';

export interface CreateSessionParams {
  userId: string;
  deviceInfo: DeviceInfo;
  sessionId?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  tokenPair: TokenPair;
}

export enum SessionValidationReason {
  NOT_FOUND = 'not_found',
  FINGERPRINT_MISMATCH = 'fingerprint_mismatch',
  EXPIRED = 'expired',
}

export interface ValidateSessionResponse {
  success: boolean;
  session?: UserSession;
  reason?: SessionValidationReason;
}
