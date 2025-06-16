import { Module } from '@nestjs/common';
import { RatesService } from './services';
import { PaycrestProvider } from './providers';

@Module({
  providers: [RatesService, PaycrestProvider],
  exports: [RatesService],
})
export class RatesModule {}
