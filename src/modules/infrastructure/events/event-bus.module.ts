import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './bus';
import { NotificationModule } from '@/modules/infrastructure/notification';
import { EventDefinitions } from './definitions';
import { DefinitionHandlers } from './handlers';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),
    NotificationModule,
  ],
  providers: [EventBusService, ...EventDefinitions, ...DefinitionHandlers],
  exports: [EventBusService],
})
export class EventBusModule {}
