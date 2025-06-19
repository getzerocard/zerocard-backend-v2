import { CardInfrastructureService, JitGatewayService } from './services';
import { RatesModule } from '@/modules/infrastructure/rates';
import { JitGatewayController } from './controllers';
import { SudoProvider } from './providers';
import { Module } from '@nestjs/common';

@Module({
  imports: [RatesModule],
  controllers: [JitGatewayController],
  providers: [SudoProvider, CardInfrastructureService, JitGatewayService],
  exports: [CardInfrastructureService],
})
export class CardInfrastructureModule {}
