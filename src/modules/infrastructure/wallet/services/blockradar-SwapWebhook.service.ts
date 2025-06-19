import { BlockradarService } from './blockradar.service';
import { BlockradarWebhookEventDto } from '../dtos';
import { BlockradarWebhookEvent } from '../types';
import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class BlockradarSwapWebhookService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly database: PrismaService,
    private readonly blockradarService: BlockradarService,
  ) {
    this.logger.setContext(BlockradarSwapWebhookService.name);
  }

   async handleSwapSuccess(data: Record<string, any>) {
    const reference = data.id;
    const fee = Number(data.amount - data.toAmount);
    const recipientAddress = data.recipientAddress;
    const asset = data.asset.symbol.toLowerCase();
    const hash = data.hash;

    await this.database.$transaction(async tx => {
      /*
       * check if the transaction already exists,
       * we want to avoid giving value to the same transaction multiple times
       */
      const transaction = await tx.transaction.findUnique({
        where: { reference },
      });

      if (!transaction) {
        this.logger.fatal('No swap transaction with this refrence has been initiated', {
          reference,
          data,
        });
        throw new Error('No swap transaction with this refrence has been initiated ');
      }

      if (transaction.status === 'COMPLETED') {
        this.logger.warn('Transaction already finalized', { reference, transaction });
        return;
      }

      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      const transactionEntry = await tx.transactionEntry.findFirst({
        where: { transactionId: transaction.id },
      });

      await tx.transactionEntry.update({
        where: { id: transactionEntry.id },
        data: {
          hash: hash,
        },
      });

      const userWallet = await tx.wallet.findUnique({
        where: { address: recipientAddress },
      });

      if (!userWallet) {
        this.logger.fatal('No user wallet found for the blockradar swap success', { data });
        throw new Error('No user wallet found for the blockradar swap success');
      }

      const token = await tx.token.findUnique({
        where: { symbol_chain: { symbol: asset, chain: userWallet.chain }, isActive: true },
      });

      if (!token) {
        this.logger.fatal('Token not found for swap success', { asset });
        throw new Error('Token not found for swap success');
      }

      await tx.walletTokenBalance.update({
        where: {
          walletId_tokenId: {
            walletId: userWallet.id,
            tokenId: token.id,
          },
        },
        data: {
          balance: {
            decrement: fee,
          },
        },
      });
    });
  }

   async handleSwapfailed(data: Record<string, any>) {
    const swapTransactionReference = data.id;

    // paramenters for swap retry
    const walletId = data.wallet.id;
    const fromAssetID = data.asset.id;
    const amount = data.amount;
    const refrence = data.reference;
    const metadata = 'deposit-swap';
    const recipientAddress = data.recipientAddress;
    const asset = data.toAsset.symbol.toLowerCase();

    await this.database.$transaction(async tx => {
      /*
       * check if the transaction already exists,
       * we want to avoid giving value to the same transaction multiple times
       */
      const transaction = await tx.transaction.findUnique({
        where: {
          reference: swapTransactionReference,
          OR: [{ status: 'FAILED' }, { status: 'COMPLETED' }],
        },
      });
      if (transaction) {
        this.logger.warn('Transaction already finalised ', {
          reference: swapTransactionReference,
          transaction,
        });
        return;
      }

      await tx.transaction.update({
        where: { reference: swapTransactionReference },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });

      const userWallet = await tx.wallet.findUnique({
        where: { address: recipientAddress },
      });

      if (!userWallet) {
        this.logger.fatal('No user wallet found for the recipient address during swap failure', {
          recipientAddress,
        });
        throw new Error('No user wallet found for the recipient address during swap failure');
      }

      // retry the failed swap
       await this.blockradarService.handleSwap({
        walletId,
        addressId: userWallet.ownerId,
        fromAssetID,
        amount,
        refrence,
        metadata,
        recipientAddress,
        asset,
      });
    });
  }
}
