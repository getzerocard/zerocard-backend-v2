import { IOAuthUser } from '../../../types';

export interface OAuthStrategy {
  authenticate(token: string): Promise<IOAuthUser>;
}
