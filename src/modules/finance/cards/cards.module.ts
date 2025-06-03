import { Module } from '@nestjs/common';
import { CardsRepository } from './repsitories';
import { CardService } from './services';

@Module({
  providers: [CardsRepository, CardService],
  exports: [CardService],
})
export class CardsModule { }
