import { SystemWalletService } from '@/modules/core/system';
import { BlockradarWebhookEventDto } from '../dtos';
import { BlockradarWebhookEvent } from '../types';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as crypto from 'crypto';

@Injectable()
export class BlockradarWebhookService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly systemWalletService: SystemWalletService,
  ) {
    this.logger.setContext(BlockradarWebhookService.name);
  }

  async handleWebhook(event: BlockradarWebhookEventDto) {
    switch (event.event) {
      case BlockradarWebhookEvent.DEPOSIT_SUCCESS:
        await this.handleDepositSuccess(event.data);
        break;
      default:
        this.logger.warn(`Unknown event: ${event.event}`);
        break;
    }
  }

  private async handleDepositSuccess(data: Record<string, any>) {}

  async validateSignature(payload: any, signature: string): Promise<boolean> {
    const data = payload.data;
    const txWallet = data.wallet;

    if (!txWallet) {
      this.logger.warn('No wallet found in the blockradar transaction payload', { payload });
      return false;
    }
    if (!txWallet.id) {
      this.logger.warn('No wallet id found in the blockradar transaction payload', { payload });
      return false;
    }

    const wallet = await this.systemWalletService.getWalletById(txWallet.id);
    if (!wallet) return false;
    if (!wallet.id) return false;

    const hmac = crypto
      .createHmac('sha256', wallet.apiKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    return hmac === signature;
  }
}
