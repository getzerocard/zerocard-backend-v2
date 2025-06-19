import { EventBusService, TokenDepositedEvent } from '@/modules/infrastructure/events';
import { BlockradarSwapWebhookService } from './blockradar-SwapWebhook.service';
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
    private readonly eventBus: EventBusService,
    private readonly blockradarSwapWebhookService: BlockradarSwapWebhookService,
  ) {
    this.logger.setContext(BlockradarWebhookService.name);
  }

  async handleWebhook(event: BlockradarWebhookEventDto) {
    this.logger.info(`Handling blockradar webhook: ${event.event}`);

    switch (event.event) {
      case BlockradarWebhookEvent.DEPOSIT_SUCCESS:
        await this.handleDepositSuccess(event.data);
        break;
      case BlockradarWebhookEvent.SWAP_SUCCESS:
        await this.blockradarSwapWebhookService.handleSwapSuccess(event.data);
        break;
      case BlockradarWebhookEvent.SWAP_FAILED:
        await this.blockradarSwapWebhookService.handleSwapfailed(event.data);
        break;
      default:
        this.logger.warn(`Unknown event: ${event.event}`);
        break;
    }
  }

  private async handleDepositSuccess(data: Record<string, any>) {
    const recipientAddress = data.recipientAddress;
    const amount = data.amount;
    const asset = data.asset.symbol.toLowerCase();
    const walletId = data.wallet.id;
    const reference = data.id;
    const senderAddress = data.senderAddress;
    const chain = data.blockchain.name;
    const aggregateId = data.wallet.name;
    const hash = data.hash;
    const addressId = data.address.id;
    const fromAssetId = data.asset.id;
    const metadata = 'deposit-swap';

    this.eventBus.publish(
      new TokenDepositedEvent(
        walletId,
        addressId,
        fromAssetId,
        amount,
        reference,
        metadata,
        recipientAddress,
        asset,
        aggregateId
      ),
    );

    await this.database.$transaction(async tx => {
      // get the user wallet based on the recipient address
      const userWallet = await tx.wallet.findUnique({
        where: { address: recipientAddress },
      });

      console.log('User Wallet >>>', userWallet);

      if (!userWallet) {
        this.logger.fatal('No user wallet found for the blockradar deposit', { data });
        throw new Error('No user wallet found for the blockradar deposit');
      }

      /*
       * check if the transaction already exists,
       * we want to avoid giving value to the same transaction multiple times
       */
      const transaction = await tx.transaction.findUnique({
        where: { reference, status: 'COMPLETED' },
      });
      if (transaction) {
        this.logger.warn('Transaction already exists', { reference, transaction });
        return;
      }

      // create transaction record
      await tx.transaction.create({
        data: {
          reference,
          user: { connect: { id: userWallet.ownerId } },
          category: 'DEPOSIT',
          status: 'COMPLETED',
          completedAt: new Date(),
          entries: {
            create: {
              walletId: userWallet.id,
              entryType: 'CREDIT',
              asset,
              amount,
              hash,
              memo: `Deposit from ${senderAddress}`,
            },
          },
        },
      });

      /**
       * update the wallet token balance
       */
      const token = await tx.token.findUnique({
        where: { symbol_chain: { symbol: asset, chain }, isActive: true },
      });
      if (!token) {
        this.logger.fatal('Token not found', { asset });
        throw new Error('Token not found');
      }

      await tx.walletTokenBalance.upsert({
        where: {
          walletId_tokenId: {
            walletId: userWallet.id,
            tokenId: token.id,
          },
        },
        create: {
          walletId: userWallet.id,
          tokenId: token.id,
          balance: amount,
        },
        update: {
          balance: {
            increment: amount,
          },
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
