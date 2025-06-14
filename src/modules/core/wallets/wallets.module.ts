import { WalletsController } from './controllers';
import { WalletsService } from './services';
import { Module } from '@nestjs/common';

@Module({
  providers: [WalletsService],
  controllers: [WalletsController],
  exports: [WalletsService],
})
export class WalletsModule {}
