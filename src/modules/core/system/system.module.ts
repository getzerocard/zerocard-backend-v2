import { Module } from '@nestjs/common';
import { SystemWalletService } from './services';

@Module({
  providers: [SystemWalletService],
  exports: [SystemWalletService],
})
export class SystemModule {}
