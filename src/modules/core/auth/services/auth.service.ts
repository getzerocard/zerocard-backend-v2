import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/core/users/services';
import { CompleteSignInDto, OAuthSigninDto } from '../dtos';
import { MfaService } from '@/modules/core/mfa/services';
import { BaseAuthService } from './base-auth.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { OauthProviderService } from './oauth';
import { AuthUserEntity } from '../entities';
import { OauthProvider } from '../types';
import { DeviceInfo, Util } from '@/shared';

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mfaService: MfaService,
    protected readonly sessionService: SessionService,
    protected readonly oauthService: OauthProviderService,
    private readonly tokenService: TokenService,
  ) {
    super(sessionService);
  }

  async signin(email: string, deviceInfo: DeviceInfo) {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create(email);
    }

    const authUser = AuthUserEntity.fromRawData(user);

    await this.mfaService.sendMfaToken(authUser, 'login');

    return this.completeAuth(authUser, deviceInfo);
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

  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const authUser = AuthUserEntity.fromRawData(user);
    await this.mfaService.sendMfaToken(authUser, 'login');
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
  }
}
