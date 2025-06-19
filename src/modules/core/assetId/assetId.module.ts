import { Module } from '@nestjs/common';
import { asssetIdService } from './services';

@Module({
  providers: [asssetIdService],
  exports: [asssetIdService],
})
export class SystemModule {}