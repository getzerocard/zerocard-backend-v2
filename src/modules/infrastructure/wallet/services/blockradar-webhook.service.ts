import { SystemWalletService } from '@/modules/core/system';
import { BlockradarWebhookEventDto } from '../dtos';
import { BlockradarWebhookEvent } from '../types';
import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as crypto from 'crypto';

@Injectable()
export class BlockradarWebhookService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly systemWalletService: SystemWalletService,
    private readonly database: PrismaService,
  ) {
    this.logger.setContext(BlockradarWebhookService.name);
  }

  async handleWebhook(event: BlockradarWebhookEventDto) {
    this.logger.info(`Handling blockradar webhook: ${event.event}`);

    switch (event.event) {
      case BlockradarWebhookEvent.DEPOSIT_SUCCESS:
        await this.handleDepositSuccess(event.data);
        break;
      default:
        this.logger.warn(`Unknown event: ${event.event}`);
        break;
    }
  }

  private async handleDepositSuccess(data: Record<string, any>) {
    const recipientAddress = data.recipientAddress;
    const amount = data.amount;
    const asset = data.asset.symbol;
    const reference = data.reference;
    const senderAddress = data.senderAddress;

    await this.database.$transaction(async tx => {
      const userWallet = await tx.wallet.findUnique({
        where: { address: recipientAddress },
      });

      if (!userWallet) {
        this.logger.fatal('No wallet found in the blockradar transaction payload', { data });
        return;
      }

      const transaction = await tx.transaction.findUnique({
        where: { reference, status: 'COMPLETED' },
      });

      if (transaction) {
        // add this step to avoid duplicate transactions
        this.logger.fatal('Transaction already exists', { reference, transaction });
        return;
      }

      await tx.transaction.create({
        data: {
          reference,
          category: 'DEPOSIT',
          status: 'COMPLETED',
          completedAt: new Date(),
          entries: {
            create: {
              walletId: userWallet.id,
              entryType: 'CREDIT',
              asset,
              amount,
              memo: `Deposit from ${senderAddress}`,
            },
          },
        },
      });

      await tx.wallet.update({
        where: { id: userWallet.id },
        data: {
          balance: { increment: amount },
        },
      });
    });
  }

  async validateSignature(payload: BlockradarWebhookEventDto, signature: string): Promise<boolean> {
    this.logger.info(`Validating blockradar webhook signature: ${signature}`);
    const data = payload.data;
    const txWallet = data.wallet;

    if (!txWallet) {
      this.logger.fatal('No wallet found in the blockradar transaction payload', { payload });
      return false;
    }
    if (!txWallet.id) {
      this.logger.fatal('No wallet id found in the blockradar transaction payload', { payload });
      return false;
    }

    const wallet = await this.systemWalletService.getWalletByProviderWalletId(txWallet.id);
    if (!wallet) {
      this.logger.fatal(
        'No related system wallet found for the blockradar transaction payload wallet',
        { payload },
      );
      return false;
    }

    const hmac = crypto
      .createHmac('sha512', wallet.apiKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    this.logger.info('Validating blockradar webhook signature', { hmac, signature });

    const equal = hmac === signature;
    if (!equal) {
      this.logger.fatal('Blockradar webhook signature validation failed', {
        payload,
        hmac,
        signature,
      });
      return false;
    }

    return equal;
  }
}
