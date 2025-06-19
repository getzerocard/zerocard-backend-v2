import { CreateCustomerParams, CreateCardParams } from '../types';
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
      const response = await this.client.post('/customers', {
        ...params,
        type: 'individual',
        status: 'active',
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create sudo customer', error);
      throw error;
    }
  }

  async createCard(params: CreateCardParams) {
    try {
      const response = await this.client.post('/cards', {
        ...params,
        type: 'physical',
        currency: 'NGN',
        status: 'active',
        sendPINSMS: true,
        issuerCountry: 'NGA',
        brand: 'Verve',
        spendingControls: {
          allowedCategories: [null],
          blockedCategories: [null],
          channels: {
            mobile: true,
            atm: true,
            pos: true,
            web: true,
          },
          spendingLimits: [
            { interval: 'daily', amount: 10000000 }, // 10_000_000 NGN - 10 million naira
          ],
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create sudo card', error);
      throw error;
    }
  }

  async getCardToken(sudoCardId: string) {
    try {
      const response = await this.client.post(`/cards/${sudoCardId}/token`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get sudo card token', error);
      throw error;
    }
  }

  async updateCard(sudoCardId: string, data: { status: 'inactive' }) {
    try {
      const response = await this.client.put(`/cards/${sudoCardId}`, data);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update sudo card', error);
      throw error;
    }
  }
}
