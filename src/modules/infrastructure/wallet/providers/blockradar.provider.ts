import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import axios, { AxiosInstance } from 'axios';
import { WalletProvider } from '../interfaces';

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

  createWalletAddress(userId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  getBalance(walletId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
