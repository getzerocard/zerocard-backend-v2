import { Module } from '@nestjs/common';
import { MfaService } from './services';
import { MfaController } from './controllers';

@Module({
  providers: [MfaService],
  controllers: [MfaController],
  exports: [MfaService],
})
export class MfaModule {}
