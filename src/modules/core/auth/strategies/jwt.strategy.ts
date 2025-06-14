import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/core/users/services';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from '../types';
import { SessionService } from '../services';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly logger: PinoLogger,
    configService: ConfigService,
    private readonly userService: UsersService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
    this.logger.setContext(JwtStrategy.name);
  }

  async validate(payload: AccessTokenPayload) {
    console.log('payload >>>', payload);
    const isSessionBlacklisted = await this.sessionService.isSessionBlacklisted(payload.sid);

    console.log('isSessionBlacklisted >>>', isSessionBlacklisted);

    if (isSessionBlacklisted) {
      this.logger.error(`Session ${payload.sid} is blacklisted`);
      throw new UnauthorizedException('Session expired, please login again');
    }

    const user = await this.userService.findUserById(payload.sub);

    if (!user) {
      this.logger.error(`User ${payload.sub} not found`);
      throw new UnauthorizedException('An error occurred, please login again');
    }

    return user;
  }
}
