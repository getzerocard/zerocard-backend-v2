import { DeviceInfo } from '@/shared';
import { TokenPair } from './token.types';

export interface CreateSessionParams {
  userId: string;
  deviceInfo: DeviceInfo;
  sessionId?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  tokenPair: TokenPair;
}
