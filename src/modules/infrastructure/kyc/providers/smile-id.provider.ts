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
      const response = await this.client.post('/smile_links', {
        ...params,
        company_name: 'zerocard',
        id_types: [
          {
            country: 'NG',
            id_type: 'PASSPORT',
            verification_method: 'doc_verification',
          },
        ],
        callback_url: 'https://zerocard.com/callback',
        data_privacy_policy_url: 'https://zerocard.com/privacy',
        logo_url: 'https://zerocard.com/logo.png',
        is_single_use: true,
        partner_params: {
          is_paying: 'true',
          customer_branch: 'country x',
        },
        expires_at: '2024-02-29T16:13:40.813Z',
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error generating kyc link: ${error}`);
      throw error;
    }
  }
}
