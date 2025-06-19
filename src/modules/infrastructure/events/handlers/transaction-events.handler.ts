import { BlockradarService } from '@/modules/infrastructure/wallet/services/blockradar.service';
import { WalletsInfrastructureService } from '@/modules/infrastructure/wallet';
import { TokenDepositedEvent } from '@/modules/infrastructure/events';
import { SystemWalletService } from '@/modules/core/system';
import { OnEvent } from '@nestjs/event-emitter';
import { TOKEN_DEPOSITED } from '@/shared';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TransactionEventsHandler {
  constructor(
    private readonly logger: PinoLogger,
    private readonly walletService: WalletsInfrastructureService,
    private readonly blockradarService: BlockradarService,
    private readonly systemWalletService: SystemWalletService,
  ) {
    this.logger.setContext(TransactionEventsHandler.name);
  }

  @OnEvent(TOKEN_DEPOSITED)
  async handleDepositSwap(event: TokenDepositedEvent) {
    const wallet = await this.systemWalletService.getWalletByProviderWalletId(event.walletId);
    await this.blockradarService.handleSwap({
      walletId: event.walletId,
      addressId: event.addressId,
      fromAssetID: event.fromAssetId,
      amount: event.amount,
      refrence: event.refrence,
      metadata: event.metadata,
      recipientAddress: event.recipientAddress,
      asset: event.asset,
    });
    this.logger.info(`Handling token.deposited event for wallet ${event.walletId}`);
  }
}
