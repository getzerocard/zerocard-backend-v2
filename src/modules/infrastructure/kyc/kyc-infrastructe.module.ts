import { Module } from '@nestjs/common';
import { SmileIdProvider } from './providers';
import { SmileIdService } from './services';
import { SmileIdController } from './controllers';

@Module({
  providers: [SmileIdProvider, SmileIdService],
  controllers: [SmileIdController],
  exports: [SmileIdService],
})
export class KycInfrastructureModule {}
