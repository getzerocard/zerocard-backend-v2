import { CardInfrastructureModule } from '@/modules/infrastructure/card';
import { CardOrdersController, CardsController } from './controllers';
import { CardOrderService, CardService } from './services';
import { WalletsModule } from '@/modules/core/wallets';
import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'cards',
        module: CardsModule,
        children: [CardOrdersController, CardsController],
      },
    ]),
    CardInfrastructureModule,
    WalletsModule,
  ],
  controllers: [CardOrdersController, CardsController],
  providers: [CardService, CardOrderService],
  exports: [CardService],
})
export class CardsModule {}
