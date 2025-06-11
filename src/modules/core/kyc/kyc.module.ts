import { KycService } from './services';
import { Module } from '@nestjs/common';

@Module({
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
