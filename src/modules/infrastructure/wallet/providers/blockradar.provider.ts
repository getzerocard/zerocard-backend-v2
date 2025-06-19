import axios, { AxiosError, AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  CreateWalletAddressParams,
  WalletProvider,
  GetSwapQuoteParams,
  ExecuteSwapParams,
} from '../types';

@Injectable()
export class BlockradarProvider implements WalletProvider {
  private readonly client: AxiosInstance;

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(BlockradarProvider.name);
    this.client = axios.create({
      timeout: 10000, // 10 seconds
      baseURL: 'https://api.blockradar.co/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createWalletAddress(params: CreateWalletAddressParams): Promise<any> {
    try {
      const response = await this.client.post(
        `/wallets/${params.walletId}/addresses`,
        {
          name: params.ownerId,
          disableAutoSweep: true,
          showPrivateKey: false,
          enableGaslessWithdraw: true,
        },
        {
          headers: {
            'x-api-key': params.apiKey,
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError;

      this.logger.error(
        {
          walletId: params.walletId,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        },
        `Failed to create wallet address on blockradar`,
      );

      throw new Error('Failed to create wallet address on blockradar');
    }
  }

  //get swap quote from blockradar

  async getSwapQuote(params: GetSwapQuoteParams): Promise<any> {
    try {
      const response = await this.client.post(
        `/wallets/${params.walletId}/addresses/swaps/quote`,
        {
          fromAssetId: params.fromAssetID,
          toAssetId: params.toAssetId,
          amount: params.amount,
          addressId: params.addressId,
        },
        {
          headers: {
            'x-api-key': params.apiKey,
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError;

      this.logger.error(
        {
          walletId: params.walletId,
          recipientAddress: params.recipientAddress,
          addressId: params.addressId,
          fromAssetId: params.fromAssetID,
          toAssetId: params.toAssetId,
          amount: params.amount,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        },
        `Failed to get swap quote from blockradar`,
      );

      throw new Error('Failed to get swap quote from blockradar');
    }
  }

  async executeSwap(params: ExecuteSwapParams): Promise<any> {
    try {
      const response = await this.client.post(
        `/wallets/${params.walletId}/addresses/${params.addressId}/swaps/execute`,
        {
          fromAssetId: params.fromAssetID,
          toAssetId: params.toAssetId,
          amount: params.amount,
          recipientAddress: params.recipientAddress,
          reference: params.refrence,
          metadata: params.metadata,
        },
        {
          headers: {
            'x-api-key': params.apiKey,
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError;

      this.logger.error(
        {
          walletId: params.walletId,
          recipientAddress: params.recipientAddress,
          addressId: params.addressId,
          fromAssetId: params.fromAssetID,
          toAssetId: params.toAssetId,
          amount: params.amount,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        },
        `Failed to execute swap on blockradar`,
      );

      throw new Error('Failed to execute swap on blockradar');
    }
  }

  getBalance(walletId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
