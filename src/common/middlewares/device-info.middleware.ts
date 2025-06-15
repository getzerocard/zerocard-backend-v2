import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, NextFunction, Response } from 'express';
import { ClientPlatform, DeviceHeaders, DeviceInfo, DeviceService } from '@/shared';

@Injectable()
export class DeviceInfoMiddleware implements NestMiddleware {
  constructor(private readonly deviceService: DeviceService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || 'unknown';

    const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
    const realIp = forwardedFor?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip;
    const ipAddress = realIp === '::1' ? '127.0.0.1' : realIp;

    const deviceId = (req.headers['x-device-id'] as string) || null;
    const deviceName = (req.headers['x-device-name'] as string) || null;
    const timezone = (req.headers['x-timezone'] as string) || null;
    const appVersion = (req.headers['x-app-version'] as string) || null;
    const clientPlatform =
      (req.headers['x-client-platform'] as ClientPlatform) || ClientPlatform.WEB;
    const sessionId = (req.headers['x-session-id'] as string) || null;
    const deviceHeaders: DeviceHeaders = {
      userAgent,
      ipAddress,
      sessionId,
      deviceId,
      deviceName,
      timezone,
      appVersion,
      clientPlatform,
    };
    const deviceInfo: DeviceInfo = this.deviceService.generateDeviceInfo(deviceHeaders);

    req['deviceInfo'] = deviceInfo;

    next();
  }
}
