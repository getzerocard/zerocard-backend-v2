import { ConfigService } from '@nestjs/config';
import { GenerateLinkParams } from '../types';
import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SmileIdProvider {
  private readonly client: AxiosInstance;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(SmileIdProvider.name);
    this.client = axios.create({
      timeout: 10000, // 10 seconds
      baseURL: this.configService.get('smileid.url'),
      headers: {
        'Content-Type': 'application/json',
        'X-Partner-Id': this.configService.get('smileid.partnerId'),
        Authorization: `Bearer ${this.configService.get('smileid.apiKey')}`,
      },
    });
  }

  async generateLink(params: GenerateLinkParams) {
    try {
      const response = await this.client.post('/smile_links', params);
      return response.data;
    } catch (error) {
      this.logger.error(`Error generating kyc link: ${error}`);
      throw error;
    }
  }
}
