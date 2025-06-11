import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { CacheService, PrismaService } from '@/infrastructure';
import { DeviceInfo, Util } from '@/shared';
import { UserSession } from '@prisma/client';
import { TokenService } from './token.service';
import {
  CreateSessionParams,
  CreateSessionResponse,
  SessionValidationReason,
  ValidateSessionResponse,
} from '../types';

@Injectable()
export class SessionService {
  private readonly blacklistCacheKey = 'blacklisted:sessions';

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly database: PrismaService,
    private readonly tokenService: TokenService,
    private readonly cacheService: CacheService,
  ) {
    this.logger.setContext(SessionService.name);
  }

  async createSession(params: CreateSessionParams): Promise<CreateSessionResponse> {
    const { deviceInfo, userId } = params;
    const sessionId = Util.generateUuid();
    const tokenPair = await this.tokenService.generateTokenPair({
      userId,
      sessionId,
    });

    const deviceData = {
      userAgent: deviceInfo.userAgent,
      deviceType: deviceInfo.deviceType,
      browserName: deviceInfo.browser,
      operatingSystem: deviceInfo.os,
      ipAddress: deviceInfo.ipPrefix,
      deviceFingerprint: deviceInfo.deviceFingerprint,
    };

    const session = await this.database.userSession.upsert({
      where: {
        userId_deviceFingerprint: {
          userId,
          deviceFingerprint: deviceInfo.deviceFingerprint,
        },
      },
      update: {
        user: { connect: { id: userId } },
        ...deviceData,
        isActive: true,
        lastActiveAt: new Date(),
      },
      create: {
        id: sessionId,
        user: { connect: { id: userId } },
        ...deviceData,
        refreshToken: await Util.generateHash(tokenPair.refreshToken),
        isActive: true,
        lastActiveAt: new Date(),
      },
    });

    return { sessionId: session.id, tokenPair };
  }

  async findSessionByFingerprint(userId: string, deviceFingerprint: string): Promise<UserSession> {
    return this.database.userSession.findUnique({
      where: {
        userId_deviceFingerprint: { userId, deviceFingerprint },
      },
    });
  }

  async revoke(sessionId: string, userId: string, revokeAll = false): Promise<void> {
    const now = new Date();

    if (revokeAll) {
      const sessions = await this.database.userSession.findMany({
        where: { userId, isActive: true },
      });

      await Promise.all([
        this.database.userSession.updateMany({
          where: { userId },
          data: { isActive: false, refreshToken: null, revokedAt: now },
        }),
        sessions.map(s => this.blacklistSession(s.id)),
      ]);
    } else {
      await Promise.all([
        this.database.userSession.update({
          where: { id: sessionId, userId },
          data: { isActive: false, refreshToken: null, revokedAt: now },
        }),
        this.blacklistSession(sessionId),
      ]);
    }
  }

  async validateSession(
    sessionId: string,
    userId: string,
    deviceInfo: DeviceInfo,
  ): Promise<ValidateSessionResponse> {
    const session = await this.database.userSession.findUnique({
      where: {
        id: sessionId,
        userId,
        deviceFingerprint: deviceInfo.deviceFingerprint,
      },
      include: {
        user: true,
      },
    });

    if (!session) return { success: false, reason: SessionValidationReason.NOT_FOUND };

    if (!session.isActive && session.revokedAt)
      return { success: false, reason: SessionValidationReason.NOT_FOUND };

    if (session.deviceFingerprint !== deviceInfo.deviceFingerprint)
      return { success: false, reason: SessionValidationReason.FINGERPRINT_MISMATCH };

    return { success: true, session };
  }

  async isSessionBlacklisted(sessionId: string): Promise<boolean> {
    return !!(await this.cacheService.get(`${this.blacklistCacheKey}:${sessionId}`));
  }

  private async blacklistSession(sessionId: string): Promise<void> {
    const ttl = this.getDurationInSecondsFromInput(
      this.configService.get<string>('JWT_ACCESS_EXPIRY'),
    );

    await this.cacheService.set(`${this.blacklistCacheKey}:${sessionId}`, true, ttl);
  }

  private getDurationInSecondsFromInput(input: string): number {
    return input.endsWith('m') ? 30 * 60 : 24 * 60 * 60;
  }
}
