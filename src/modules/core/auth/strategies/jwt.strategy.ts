import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/core/users/services';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from '../types';
import { AuthUserEntity } from '../entities';
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
      secretOrKey: configService.get<string>('jwt.accessSecret'),
    });
    this.logger.setContext(JwtStrategy.name);
  }

  async validate(payload: AccessTokenPayload) {
    const isSessionBlacklisted = await this.sessionService.isSessionBlacklisted(payload.sid);

    if (isSessionBlacklisted) {
      this.logger.error(`Session ${payload.sid} is blacklisted`);
      throw new UnauthorizedException('Session expired, please login again');
    }

    const user = await this.userService.findUserById(payload.sub);

    if (!user) {
      this.logger.error(`User ${payload.sub} not found`);
      throw new UnauthorizedException('An error occurred, please login again');
    }
    const authUser = AuthUserEntity.fromRawData(user);
    return authUser;
  }
}
