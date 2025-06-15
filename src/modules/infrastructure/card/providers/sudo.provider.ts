import { CreateCardParams, CreateCustomerParams } from '../types';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SudoProvider {
  private readonly client: AxiosInstance;

  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(SudoProvider.name);
    this.client = axios.create({
      timeout: 10000, // 10 seconds
      baseURL: this.configService.get('sudo.url'),
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.configService.get('sudo.apiKey'),
      },
    });
  }

  async createCustomer(params: CreateCustomerParams) {
    try {
      const response = await this.client.post('/customers', params);
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async createCard(params: CreateCardParams) {
    try {
      const response = await this.client.post('/cards', params);
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
