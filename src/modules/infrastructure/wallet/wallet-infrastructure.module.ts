import { Module } from '@nestjs/common';
import { BlockradarProvider } from './providers';
import { BlockradarController } from './controllers';
import {
  BlockradarService,
  BlockradarWebhookService,
  WalletsInfrastructureService,
} from './services';
import { SystemModule } from '@/modules/core/system';

@Module({
  imports: [SystemModule],
  providers: [
    BlockradarProvider,
    BlockradarService,
    BlockradarWebhookService,
    WalletsInfrastructureService,
  ],
  controllers: [BlockradarController],
  exports: [WalletsInfrastructureService],
})
export class WalletInfrastructureModule {}
