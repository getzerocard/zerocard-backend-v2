import { Module } from '@nestjs/common';
import { SudoController } from './controllers';
import { SudoProvider } from './providers';

@Module({
  controllers: [SudoController],
  providers: [SudoProvider],
  exports: [SudoProvider],
})
export class CardInfrastructureModule {}
