import { OAuthStrategy } from './oauth-strategy.interface';
import { IOAuthUser } from '@/modules/core/auth/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppleOAuthStrategy implements OAuthStrategy {
  constructor() {}
  authenticate(token: string): Promise<IOAuthUser> {
    throw new Error('Method not implemented.');
  }
}
