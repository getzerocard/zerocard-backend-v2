import { CardInfrastructureModule } from '@/modules/infrastructure/card';
import { CardOrdersController, CardsController } from './controllers';
import { CardOrderService, CardService } from './services';
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
  ],
  controllers: [CardOrdersController, CardsController],
  providers: [CardService, CardOrderService],
  exports: [CardService],
})
export class CardsModule {}
