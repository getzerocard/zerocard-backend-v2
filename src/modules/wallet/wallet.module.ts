import { Module } from '@nestjs/common';
import { WalletRepository } from './repositories';
import { WalletService } from './services';

@Module({
  providers: [WalletRepository, WalletService],
  exports: [WalletService],
})
export class WalletModule { }
