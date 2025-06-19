import { SystemConfigService } from '@/modules/infrastructure/system-config';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  async onApplicationBootstrap() {
    await this.systemConfigService.loadConfig();
  }
}
