import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AUTH_CONSTANTS } from '../constants';

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) {}

  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    const isLocal = this.configService.get('APP_ENV') === 'local';
    const maxAge = AUTH_CONSTANTS.SESSION.TTL_DAYS * 24 * 60 * 60 * 1000;

    res.cookie(AUTH_CONSTANTS.COOKIE.REFRESH_TOKEN_KEY, refreshToken, {
      ...AUTH_CONSTANTS.COOKIE.OPTIONS,
      sameSite: isLocal ? 'none' : 'strict',
      secure: true,
      maxAge,
    });
  }

  extractRefreshToken(req: Request): string {
    const refreshToken = req.headers['x-refresh-token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return refreshToken;
  }

  clearRefreshTokenCookie(res: Response): void {
    const secure = this.configService.get('APP_ENV') === 'production';

    res.clearCookie(AUTH_CONSTANTS.COOKIE.REFRESH_TOKEN_KEY, {
      ...AUTH_CONSTANTS.COOKIE.OPTIONS,
      secure,
    });
  }
}
