import { GoogleOAuthStrategy, OAuthStrategy } from './strategies';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/core/users/services';
import { PrismaService } from '@/infrastructure';
import { AuthUserEntity } from '../../entities';
import { OauthProvider } from '../../types';
import { OAuthSigninDto } from '../../dtos';
import { PinoLogger } from 'nestjs-pino';
import { IOAuthUser } from '../../types';
import { User } from '@prisma/client';

@Injectable()
export class OauthProviderService {
  private readonly strategies: Map<OauthProvider, OAuthStrategy>;

  constructor(
    private readonly database: PrismaService,
    private readonly userService: UsersService,
    private readonly logger: PinoLogger,
    private readonly googleStrategy: GoogleOAuthStrategy,
  ) {
    this.logger.setContext(OauthProviderService.name);

    // Initialize strategies map
    this.strategies = new Map<OauthProvider, OAuthStrategy>([
      [OauthProvider.GOOGLE, this.googleStrategy],
    ]);
  }

  /**
   * Find a user with OAuth connections
   */
  async findUserWithAuthDetails(email: string, provider: OauthProvider) {
    const user = await this.database.user.findUnique({
      where: {
        email,
      },
      include: {},
    });
    // const user = await this.userService.findUser(
    //   { email: email },
    //   {
    //     password: true,
    //     oauthConnections: {
    //       where: { provider },
    //     },
    //     role: true,
    //   },
    // );
    if (!user) return null;
    return AuthUserEntity.fromRawData(user);
  }

  /**
   * Validate if a user can authenticate with the given provider
   */
  async validateExistingAuth(user: AuthUserEntity, provider: OauthProvider): Promise<void> {
    const accountLinkedToProvider = user.isConnectedToProvider(provider);

    if (!accountLinkedToProvider) {
      throw new BadRequestException(
        'This email is already linked to another authentication method.',
      );
    }
  }

  /**
   * Check if a user is connected to a specific OAuth provider
   */
  isUserConnectedToProvider(user: AuthUserEntity, provider: OauthProvider): boolean {
    return user.isConnectedToProvider(provider);
  }

  /**
   * Authenticate with an OAuth provider
   */
  async findOauthUser(provider: OauthProvider, dto: OAuthSigninDto): Promise<IOAuthUser> {
    try {
      const strategy = this.strategies.get(provider);
      if (!strategy) {
        this.logger.error({ provider }, 'Invalid OAuth provider');
        throw new BadRequestException('Invalid provider');
      }

      const oauthUser = await strategy.authenticate(dto.idToken);
      if (!oauthUser) {
        this.logger.error({ provider }, 'Failed to authenticate with provider');
        throw new BadRequestException('Failed to authenticate with provider');
      }

      this.logger.info(
        { provider, email: oauthUser.email },
        'Successfully authenticated with provider',
      );

      return oauthUser;
    } catch (error) {
      this.logger.error({ error, provider }, 'OAuth authentication failed');
      throw error;
    }
  }

  /**
   * Create a new user from OAuth data
   */
  async createUserFromOAuth(oauthUser: IOAuthUser, provider: OauthProvider): Promise<User> {
    return this.database.user.create({
      data: {
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        avatar: oauthUser.picture,
        emailVerifiedAt: new Date(),
        oauthConnections: {
          create: [{ provider, providerUserId: oauthUser.providerUserId }],
        },
      },
    });
  }
}
