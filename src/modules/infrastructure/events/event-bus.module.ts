import { EventEmitterModule } from '@nestjs/event-emitter';
import { WalletInfrastructureModule } from '../wallet';
import { NotificationModule } from '../notification';
import { EventDefinitions } from './definitions';
import { Module, Global } from '@nestjs/common';
import { DefinitionHandlers } from './handlers';
import { EventBusService } from './bus';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),
    NotificationModule,
    WalletInfrastructureModule,
  ],
  providers: [EventBusService, ...EventDefinitions, ...DefinitionHandlers],
  exports: [EventBusService],
})
export class EventBusModule {}
