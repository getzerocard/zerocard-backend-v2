import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        connection: {
          url: config.get('REDIS_URL', 'redis://localhost:6379'),
          db: 1,
        },
        defaultJobOptions: {
          removeOnComplete: true,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppQueueModule {}
