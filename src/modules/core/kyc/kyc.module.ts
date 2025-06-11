import { KycInfrastructureModule } from '@/modules/infrastructure/kyc';
import { KycController } from './controllers';
import { Module } from '@nestjs/common';
import { KycService } from './services';

@Module({
  imports: [KycInfrastructureModule],
  providers: [KycService],
  controllers: [KycController],
  exports: [KycService],
})
export class KycModule {}
