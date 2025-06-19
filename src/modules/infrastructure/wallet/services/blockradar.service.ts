import { SystemWalletService } from '@/modules/core/system';
import { BlockradarProvider } from '../providers';
import { handleSwap } from '../types';
import { WalletChain } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infrastructure/database/prisma';
import { asssetIdService } from '@/modules/core/assetId/services';

interface WalletAddress {
  id: string;
  address: string;
  chain: WalletChain;
}

@Injectable()
export class BlockradarService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly blockradarProvider: BlockradarProvider,
    private readonly systemWalletService: SystemWalletService,
    private readonly database: PrismaService,
    private readonly assetIdService: asssetIdService,
  ) {
    this.logger.setContext(BlockradarService.name);
  }

  async createWalletAddresses(ownerId: string): Promise<WalletAddress[]> {
    const wallets = await this.systemWalletService.getWallets();
    const addresses: WalletAddress[] = [];

    for (const wallet of wallets) {
      const response = await this.blockradarProvider.createWalletAddress({
        ...wallet,
        ownerId: `zrcrd:${ownerId}`, // add zrcrd as a prefix, just for fancy, depicts zerocard
      });
      const data = response.data;
      addresses.push({
        id: data.id,
        address: data.address,
        chain: data.blockchain.name,
      });
    }

    return addresses;
  }

  async handleSwap(params: handleSwap): Promise<any> {
    const wallet = await this.systemWalletService.getWalletByProviderWalletId(params.walletId);
    const Asset = await this.assetIdService.getAssetId(params.asset, 'base');
    const commonSwapParams = {
      walletId: params.walletId,
      apiKey: wallet.apiKey,
      addressId: params.addressId,
      fromAssetID: params.fromAssetID,
      toAssetId: Asset.assetId,
      amount: params.amount,
      recipientAddress: params.recipientAddress,
      asset: params.asset,
    };

    // Get swap quote
    const swapQuote = await this.blockradarProvider.getSwapQuote(commonSwapParams);

    if (swapQuote.data.slippage > 2.0) {
      this.logger.error(
        {
          walletId: params.walletId,
          addressId: params.addressId,
          fromAssetId: params.fromAssetID,
          toAssetId: Asset.assetId,
          amount: params.amount,
          slippage: swapQuote.data.slippage,
        },
        `Slippage too high`,
      );

      return;
    }

    // Execute swap
    const response = await this.blockradarProvider.executeSwap({
      ...commonSwapParams,
      refrence: params.refrence,
      metadata: params.metadata,
    });
    const swapResult = response.data;

    await this.database.$transaction(async tx => {
      // get the user wallet based on the recipient address
      const userWallet = await tx.wallet.findUnique({
        where: { address: params.recipientAddress },
      });
      if (!userWallet) {
        this.logger.fatal(`No user wallet found for this ${params.metadata}`);
      }
      /*
       * check if the swap has already been executed
       * we want to avoid executing the same swap multiple times
       */
      const transaction = await tx.transaction.findUnique({
        where: { reference: swapResult.id, status: 'COMPLETED' },
      });
      if (transaction) {
        this.logger.warn('Transaction already exists', { reference: params.refrence, transaction });
        return;
      }
      // create the swap transaction record

      await tx.transaction.create({
        data: {
          reference: swapResult.id,
          user: { connect: { id: userWallet.ownerId } },
          category: 'DEPOSIT',
          status: 'PENDING',
          completedAt: new Date(),
          entries: {
            create: {
              walletId: userWallet.id,
              entryType: 'SWAP',
              asset: params.asset,
              amount: params.amount,
              memo: `swap from ${params.fromAssetID} to ${'toAssetId'}`,
            },
          },
        },
      });
    }
  );
  }
}
