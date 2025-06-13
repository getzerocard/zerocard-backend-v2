import { Module } from '@nestjs/common';
import { BlockradarProvider } from './providers';
import { BlockradarController } from './controllers';
import { BlockradarService } from './services';
import { SystemModule } from '@/modules/core/system';

@Module({
  imports: [SystemModule],
  providers: [BlockradarProvider, BlockradarService],
  controllers: [BlockradarController],
  exports: [BlockradarProvider, BlockradarService],
})
export class WalletInfrastructureModule {}
