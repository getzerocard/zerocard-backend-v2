import { EventBusService, SendSignInOtpEvent } from '@/modules/infrastructure/events';
import { SessionService } from './session.service';
import { CacheService } from '@/infrastructure';
import { AuthUserEntity } from '../entities';
import { DeviceInfo, Util } from '@/shared';
import { BadRequestException } from '@nestjs/common';

export class BaseAuthService {
  constructor(
    protected readonly sessionService: SessionService,
    protected readonly cache: CacheService,
    protected readonly eventBus: EventBusService,
  ) {}

  async completeAuth(user: AuthUserEntity, deviceInfo: DeviceInfo) {
    const session = await this.sessionService.createSession({
      userId: user.getId(),
      deviceInfo,
    });

    const response = {
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
        walletsGeneratedAt: !!user.walletsGeneratedAt,
      },
    };
    return response;
  }

  private async generateToken(email: string): Promise<string> {
    const token = Util.generateOtp(6);
    const cacheKey = `signin-otp-${email}`;
    const hashedToken = await Util.generateHash(token);

    await this.cache.set(cacheKey, hashedToken, 60 * 10); // 10 minutes

    return token;
  }

  private formatDateWithTimezone(date: Date, timezone: string): string {
    // Get ordinal suffix for day
    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    const partMap = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const day = parseInt(partMap.day);
    const ordinalSuffix = getOrdinalSuffix(day);

    return `${partMap.weekday}, ${day}${ordinalSuffix} ${partMap.month}, ${partMap.year}, ${partMap.hour}:${partMap.minute}:${partMap.second} ${partMap.dayPeriod}`;
  }

  protected async sendSiginInOtp(user: AuthUserEntity, deviceInfo: DeviceInfo) {
    const token = await this.generateToken(user.email);
    const formattedTime = this.formatDateWithTimezone(new Date(), deviceInfo.timezone);

    this.eventBus.publish(
      new SendSignInOtpEvent(
        user.id,
        user.email,
        token,
        formattedTime,
        deviceInfo.timezone,
        deviceInfo.fullIp,
        user.firstName || '',
      ),
    );
  }

  protected async verifySignInOtp(user: AuthUserEntity, otp: string) {
    const cacheKey = `signin-otp-${user.email}`;
    const hashedToken = await this.cache.get<string>(cacheKey);

    if (!hashedToken) {
      throw new BadRequestException('Invalid OTP');
    }

    const isValid = await Util.validateHash(otp, hashedToken);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.cache.delete(cacheKey);

    return;
  }
}
