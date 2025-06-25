import { CardInfrastructureService, JitGatewayService } from './services';
import { RatesModule } from '@/modules/infrastructure/rates';
import { WalletsModule } from '@/modules/core/wallets';
import { JitGatewayController } from './controllers';
import { SudoProvider } from './providers';
import { Module } from '@nestjs/common';

@Module({
  imports: [RatesModule, WalletsModule],
  controllers: [JitGatewayController],
  providers: [SudoProvider, CardInfrastructureService, JitGatewayService],
  exports: [CardInfrastructureService],
})
export class CardInfrastructureModule {}
