import { CardOrdersController, CardsController } from './controllers';
import { CardOrderService, CardService } from './services';
import { CardsRepository } from './repsitories';
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
  ],
  controllers: [CardOrdersController, CardsController],
  providers: [CardsRepository, CardService, CardOrderService],
  exports: [CardService],
})
export class CardsModule {}
