import { WalletInfrastructureModule } from '@/modules/infrastructure/wallet';
import { RatesModule } from '@/modules/infrastructure/rates';
import { WalletsController } from './controllers';
import { WalletsService } from './services';
import { Module } from '@nestjs/common';

@Module({
  imports: [WalletInfrastructureModule, RatesModule],
  providers: [WalletsService],
  controllers: [WalletsController],
  exports: [WalletsService],
})
export class WalletsModule {}
