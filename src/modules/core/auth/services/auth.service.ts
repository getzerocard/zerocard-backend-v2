import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/core/users/services';
import { MfaService } from '@/modules/core/mfa/services';
import { SessionService } from './session.service';
import { CompleteSignInDto } from '../dtos';
import { DeviceInfo } from '@/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mfaService: MfaService,
    private readonly sessionService: SessionService,
  ) {}

  async signin(email: string) {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create(email);
    }
    await this.mfaService.sendMfaToken(user, 'login');
    return user;
  }

  async completeSignIn(dto: CompleteSignInDto, deviceInfo: DeviceInfo) {
    const { email, code } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.mfaService.verifyToken(email, 'login', code);

    const session = await this.sessionService.createSession({
      userId: user.id,
      deviceInfo,
    });

    return {
      sessionId: session.sessionId,
      accessToken: session.tokenPair.accessToken,
      refreshToken: session.tokenPair.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        uniqueName: user.uniqueName,
      },
    };
  }
}
