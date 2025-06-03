import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: RefreshTokenStrategy.extractToken,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  validate(req: Request, payload: any) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Expired session, please login again');
    }

    return true;
  }

  private static extractToken(req: Request): string | null {
    // handle for mobile
    const headerToken = req.headers['x-refresh-token'];

    if (typeof headerToken === 'string' && headerToken.trim().length > 0) {
      return headerToken;
    }

    // handle for web
    const cookieToken = req.cookies?.refreshToken;

    if (typeof cookieToken === 'string') {
      return cookieToken;
    }

    throw new UnauthorizedException('Expired session, please login again');
  }
}
