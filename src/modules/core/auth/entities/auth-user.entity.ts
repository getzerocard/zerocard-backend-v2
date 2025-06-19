import { User, UserAddress } from '@prisma/client';
import { OauthProvider } from '../types';
import { UserEntity } from '@/shared';

export class AuthUserEntity extends UserEntity {
  private readonly user: User;

  constructor(user: User & { address: UserAddress }) {
    super(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.dateOfBirth,
      user.avatar,
      user.phoneNumber,
      user.uniqueName,
      user.createdAt,
      user.updatedAt,
      user.walletsGeneratedAt,
      user.kycStatus,
      user.address,
    );
    this.user = user;
  }

  static fromRawData(user: User & { address: UserAddress }): AuthUserEntity {
    return new AuthUserEntity(user);
  }

  isConnectedToProvider(provider: OauthProvider): boolean {
    return this.user['authProviders'].some(p => p.provider === provider);
  }
}
