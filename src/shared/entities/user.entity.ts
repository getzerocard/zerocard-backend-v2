import { KycStatus, User } from '@prisma/client';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly avatar: string,
    public readonly uniqueName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly walletsGeneratedAt: Date,
    public readonly kycStatus: KycStatus,
  ) {}

  static fromRawData(user: User): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.avatar,
      user.uniqueName,
      user.createdAt,
      user.updatedAt,
      user.walletsGeneratedAt,
      user.kycStatus,
    );
  }

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  walletsGenerated(): boolean {
    return !!this.walletsGeneratedAt;
  }

  getProfile() {
    return {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      avatar: this.avatar,
      uniqueName: this.uniqueName,
      walletsGenerated: !!this.walletsGeneratedAt,
      kycStatus: this.kycStatus,
    };
  }
}
