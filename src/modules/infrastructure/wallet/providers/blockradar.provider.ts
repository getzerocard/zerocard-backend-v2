import { WalletProvider } from '../interfaces';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class BlockradarProvider implements WalletProvider {
  private readonly client: AxiosInstance;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(BlockradarProvider.name);
    this.client = axios.create({
      timeout: 10000, // 10 seconds
      baseURL: 'https://api.blockradar.co/v1/',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.configService.get('blockradar.apiKey'),
      },
    });
  }

  async createWalletAddress(walletId: string): Promise<any> {
    try {
      const response = await this.client.post(`/wallets/${walletId}/addresses`);

      return response.data;
    } catch (error) {
      throw new Error('Failed to create wallet address on blockradar');
    }
  }

  getBalance(walletId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
