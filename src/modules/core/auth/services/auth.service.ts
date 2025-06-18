import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { EventBusService } from '@/modules/infrastructure/events';
import { UsersService } from '@/modules/core/users/services';
import { CompleteSignInDto, OAuthSigninDto } from '../dtos';
import { BaseAuthService } from './base-auth.service';
import { SessionService } from './session.service';
import { CacheService } from '@/infrastructure';
import { TokenService } from './token.service';
import { OauthProviderService } from './oauth';
import { AuthUserEntity } from '../entities';
import { DeviceInfo, Util } from '@/shared';
import { OauthProvider } from '../types';

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(
    private readonly usersService: UsersService,
    protected readonly sessionService: SessionService,
    private readonly oauthService: OauthProviderService,
    private readonly tokenService: TokenService,
    protected readonly cache: CacheService,
    protected readonly eventBus: EventBusService,
  ) {
    super(sessionService, cache, eventBus);
  }

  async signin(email: string, deviceInfo: DeviceInfo) {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create(email);
    }

    const authUser = AuthUserEntity.fromRawData(user);

    await this.sendSiginInOtp(authUser, deviceInfo);

    return;
  }

  async completeSignIn(dto: CompleteSignInDto, deviceInfo: DeviceInfo) {
    const { email, code } = dto;
    const user = await this.usersService.findByEmail(email, {
      address: true,
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.completeAuth(AuthUserEntity.fromRawData(user), deviceInfo);
  }

  async oauthSignin(provider: OauthProvider, dto: OAuthSigninDto, deviceInfo: DeviceInfo) {
    const oauthUser = await this.oauthService.findOauthUser(provider, dto);
    const user = await this.usersService.findByEmail(oauthUser.email, {
      address: true,
    });

    if (user) {
      const authUser = AuthUserEntity.fromRawData(user);
      await this.oauthService.validateExistingAuth(authUser, provider);

      if (!this.oauthService.isUserConnectedToProvider(authUser, provider)) {
        throw new BadRequestException('User is not connected to this provider');
      }
      return this.completeAuth(authUser, deviceInfo);
    }

    const newUser = await this.oauthService.createUserFromOAuth(oauthUser, provider);
    const authUser = AuthUserEntity.fromRawData(newUser);

    return this.completeAuth(authUser, deviceInfo);
  }

  async refreshToken(refreshToken: string, deviceInfo: DeviceInfo) {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { userId, sessionId } = await this.tokenService.validateRefreshToken(refreshToken);
    const validSession = await this.sessionService.validateSession(sessionId, userId, deviceInfo);

    // if session is not valid, just throw an error
    if (!validSession.success) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = validSession.session;
    const isValidRefreshToken = await Util.validateHash(refreshToken, session.refreshToken);

    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenPair = await this.sessionService.createSession({
      userId: session.userId,
      deviceInfo,
    });

    return {
      sessionId: tokenPair.sessionId,
      accessToken: tokenPair.tokenPair.accessToken,
      refreshToken: tokenPair.tokenPair.refreshToken,
    };
  }

  async logout(user: AuthUserEntity, deviceInfo: DeviceInfo) {
    const session = await this.sessionService.findSessionByFingerprint(
      user.id,
      deviceInfo.deviceFingerprint,
    );
    if (session) {
      await this.sessionService.revoke(session.id, user.id);
    }
    return;
  }
}
