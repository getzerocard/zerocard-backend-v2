import { DeviceInfo } from '@/shared';
import { SessionService } from './session.service';
import { AuthUserEntity } from '../entities';

export class BaseAuthService {
  constructor(protected readonly sessionService: SessionService) {}

  async completeAuth(user: AuthUserEntity, deviceInfo: DeviceInfo) {
    const session = await this.sessionService.createSession({
      userId: user.getId(),
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
