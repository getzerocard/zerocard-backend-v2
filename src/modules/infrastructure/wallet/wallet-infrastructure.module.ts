import { Module } from '@nestjs/common';
import { BlockradarProvider } from './providers';
import { BlockradarController } from './controllers';
import { BlockradarService } from './services';

@Module({
  providers: [BlockradarProvider, BlockradarService],
  controllers: [BlockradarController],
  exports: [BlockradarProvider, BlockradarService],
})
export class WalletInfrastructureModule {}
