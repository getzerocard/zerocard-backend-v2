import { ConfigService } from '@nestjs/config';
import { SmileIdProvider } from '../providers';
import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SmileIdService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly smileIdProvider: SmileIdProvider,
  ) {
    this.logger.setContext(SmileIdService.name);
    this.client = axios.create({
      timeout: 15000,
      baseURL: this.configService.get('smileid.url'),
      headers: {},
    });
  }

  async generateLink() {}
}
