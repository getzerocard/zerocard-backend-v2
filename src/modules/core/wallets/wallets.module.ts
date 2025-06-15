import { Module } from '@nestjs/common';
import { WalletsController } from './controllers';
import { WalletsService } from './services';
import { WalletInfrastructureModule } from '@/modules/infrastructure/wallet';

@Module({
  imports: [WalletInfrastructureModule],
  providers: [WalletsService],
  controllers: [WalletsController],
  exports: [WalletsService],
})
export class WalletsModule {}
