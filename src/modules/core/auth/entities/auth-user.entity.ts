import { OauthProvider } from '../types';
import { UserEntity } from '@/shared';
import { User } from '@prisma/client';

export class AuthUserEntity extends UserEntity {
  private readonly user: User;

  constructor(user: User) {
    super(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.avatar,
      user.uniqueName,
      user.createdAt,
      user.updatedAt,
      user.walletsGeneratedAt,
    );
    this.user = user;
  }

  static fromRawData(user: User): AuthUserEntity {
    return new AuthUserEntity(user);
  }

  isConnectedToProvider(provider: OauthProvider): boolean {
    return this.user['authProviders'].some(p => p.provider === provider);
  }
}
