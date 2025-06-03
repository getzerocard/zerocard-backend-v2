import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '@/modules/core/user/services';
import { AuthUserEntity } from '../entities';

@Injectable()
export class UnlockStrategy extends PassportStrategy(Strategy, 'unlock-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: UnlockStrategy.extractFromXRefreshToken,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Expired session, please login again');
    }

    const user = await this.userService.findUser({ id: payload.sub }, { auth: true });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return AuthUserEntity.fromRawData(user);
  }

  private static extractFromXRefreshToken(req: Request): string | null {
    const token = req.headers['x-refresh-token'];

    if (typeof token === 'string' && token.trim().length > 0) {
      return token;
    }

    throw new UnauthorizedException('Expired session, please login again');
  }
}
