import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginService } from '../services';
import { AuthUserEntity } from '../entities';
import { ErrorMessage } from '@/shared';
import { AuthErrorType } from '../constants';
import { UnauthorizedError } from '../errors';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private loginService: LoginService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.loginService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedError(
        AuthErrorType.INVALID_CREDENTIALS,
        ErrorMessage.INVALID_CREDENTIALS,
      );
    }

    return AuthUserEntity.fromRawData(user);
  }
}
