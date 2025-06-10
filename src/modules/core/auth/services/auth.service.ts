import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/core/users/services';
import { CompleteSignInDto, OAuthSigninDto } from '../dtos';
import { MfaService } from '@/modules/core/mfa/services';
import { BaseAuthService } from './base-auth.service';
import { SessionService } from './session.service';
import { OauthProviderService } from './oauth';
import { AuthUserEntity } from '../entities';
import { OauthProvider } from '../types';
import { DeviceInfo } from '@/shared';

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mfaService: MfaService,
    protected readonly sessionService: SessionService,
    protected readonly oauthService: OauthProviderService,
  ) {
    super(sessionService);
  }

  async signin(email: string) {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create(email);
    }

    const authUser = AuthUserEntity.fromRawData(user);

    await this.mfaService.sendMfaToken(authUser, 'login');

    return user;
  }

  async completeSignIn(dto: CompleteSignInDto, deviceInfo: DeviceInfo) {
    const { email, code } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.mfaService.verifyToken(email, 'login', code);

    return this.completeAuth(AuthUserEntity.fromRawData(user), deviceInfo);
  }

  async oauthSignin(provider: OauthProvider, dto: OAuthSigninDto, deviceInfo: DeviceInfo) {
    const oauthUser = await this.oauthService.findOauthUser(provider, dto);
    const user = await this.usersService.findByEmail(oauthUser.email);

    if (user) {
      const authUser = AuthUserEntity.fromRawData(user);
      await this.oauthService.validateExistingAuth(authUser, provider);

      if (!this.oauthService.isUserConnectedToProvider(authUser, provider)) {
        throw new UnauthorizedException('User is not connected to this provider');
      }
      return this.completeAuth(authUser, deviceInfo);
    }

    const newUser = await this.oauthService.createUserFromOAuth(oauthUser, provider);
    const authUser = AuthUserEntity.fromRawData(newUser);

    return this.completeAuth(authUser, deviceInfo);
  }
}
