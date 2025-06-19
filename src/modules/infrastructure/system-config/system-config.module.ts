import { SystemConfigService } from './services';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
