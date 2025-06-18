import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemConfigService {
  private config: Record<string, any> = {};

  constructor(private readonly database: PrismaService) {}

  async loadConfig() {
    const settings = await this.database.systemConfig.findMany();
    this.config = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }

  get(key: string) {
    return this.config[key];
  }

  getAll() {
    return this.config;
  }
}
