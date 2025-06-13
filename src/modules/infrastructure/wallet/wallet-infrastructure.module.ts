import { Module } from '@nestjs/common';
import { BlockradarProvider } from './providers';
import { BlockradarController } from './controllers';
import { BlockradarService, BlockradarWebhookService } from './services';
import { SystemModule } from '@/modules/core/system';

@Module({
  imports: [SystemModule],
  providers: [BlockradarProvider, BlockradarService, BlockradarWebhookService],
  controllers: [BlockradarController],
  exports: [BlockradarProvider, BlockradarService, BlockradarWebhookService],
})
export class WalletInfrastructureModule {}
