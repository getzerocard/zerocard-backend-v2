import { MetaMapController } from './controllers';
import { MetaMapProvider } from './providers';
import { MetaMapService } from './services';
import { Module } from '@nestjs/common';

@Module({
  providers: [MetaMapProvider, MetaMapService],
  controllers: [MetaMapController],
  exports: [],
})
export class KycInfrastructureModule {}
