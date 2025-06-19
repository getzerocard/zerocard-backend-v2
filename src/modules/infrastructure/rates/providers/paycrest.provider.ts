import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PaycrestProvider {
  private readonly client: AxiosInstance;

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(PaycrestProvider.name);
    this.client = axios.create({
      timeout: 10000, // 10 seconds
      baseURL: 'https://api.paycrest.io/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getRates(token: string) {
    try {
      const response = await this.client.get(`/rates/${token}/1/ngn`);
      return response.data;
    } catch (error) {
      this.logger.error('PaycrestProvider: Error getting rates', { error });
      throw error;
    }
  }
}
