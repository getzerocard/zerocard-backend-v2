import { DeviceService } from './services';
import { Module } from '@nestjs/common';

@Module({
  providers: [DeviceService],
  exports: [DeviceService],
})
export class SharedModule {}
