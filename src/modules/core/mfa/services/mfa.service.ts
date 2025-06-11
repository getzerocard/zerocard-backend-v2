import { Send2FATokenEvent } from '@/modules/infrastructure/events/definitions';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EventBusService } from '@/modules/infrastructure/events';
import { MfaContext } from '@/modules/core/mfa/dtos';
import { CacheService } from '@/infrastructure';
import { UserEntity, Util } from '@/shared';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MfaService {
  private readonly MFA_SECRET_PREFIX = 'mfa_secret_';
  private readonly MFA_SECRET_TTL = 60 * 10; // 10 minutes

  constructor(
    private readonly logger: PinoLogger,
    private readonly cache: CacheService,
    private readonly eventBus: EventBusService,
  ) {
    this.logger.setContext(MfaService.name);
  }

  private async generateToken(identifier: string, context: MfaContext): Promise<string> {
    const token = Util.generateOtp(6);
    const cacheKey = `${this.MFA_SECRET_PREFIX}-${identifier}-${context}`;
    const hashedToken = await Util.generateHash(token);

    await this.cache.set(cacheKey, hashedToken, this.MFA_SECRET_TTL);

    return token;
  }

  async sendMfaToken(user: UserEntity, context: MfaContext): Promise<void> {
    const token = await this.generateToken(user.email, context);

    this.eventBus.publish(new Send2FATokenEvent(user.id, user.email, user.firstName, token));

    return;
  }

  async verifyToken(identifier: string, context: MfaContext, token: string): Promise<boolean> {
    const cacheKey = `${this.MFA_SECRET_PREFIX}-${identifier}-${context}`;
    const cachedToken = await this.cache.get<string>(cacheKey);

    if (!cachedToken) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const isValid = await Util.validateHash(token, cachedToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    await this.cache.delete(cacheKey);

    return;
  }
}
