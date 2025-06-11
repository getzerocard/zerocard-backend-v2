import { KycController } from './controllers';
import { Module } from '@nestjs/common';
import { KycService } from './services';

@Module({
  providers: [KycService],
  controllers: [KycController],
  exports: [KycService],
})
export class KycModule {}
