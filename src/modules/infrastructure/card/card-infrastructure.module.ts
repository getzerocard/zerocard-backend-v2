import { CardInfrastructureService, JitGatewayService } from './services';
import { JitGatewayController } from './controllers';
import { SudoProvider } from './providers';
import { Module } from '@nestjs/common';

@Module({
  controllers: [JitGatewayController],
  providers: [SudoProvider, CardInfrastructureService, JitGatewayService],
  exports: [CardInfrastructureService],
})
export class CardInfrastructureModule {}
