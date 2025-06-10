import { OAuthStrategy } from './oauth-strategy.interface';
import { Injectable } from '@nestjs/common';
import { IOAuthUser } from '../../../types';
import { PinoLogger } from 'nestjs-pino';
import axios from 'axios';

@Injectable()
export class GoogleOAuthStrategy implements OAuthStrategy {
  private readonly axiosInstance = axios.create({ timeout: 15000 });

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GoogleOAuthStrategy.name);
  }

  async authenticate(idToken: string): Promise<IOAuthUser> {
    try {
      const userPayload = await this.axiosInstance.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${idToken}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            Accept: 'application/json',
          },
        },
      );

      return this.normalizeOauthUser(userPayload.data);
    } catch (error) {
      this.logger.error({ error }, 'Error authenticating with Google');
      throw error;
    }
  }

  private normalizeOauthUser(data: any): IOAuthUser {
    return {
      providerUserId: data?.id || data?.sub,
      email: data?.email,
      firstName: data?.given_name,
      lastName: data?.family_name,
      picture: data?.picture,
    };
  }
}
