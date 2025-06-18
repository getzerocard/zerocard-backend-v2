import { AppCacheModule, AppLoggerModule, AppQueueModule, PrismaModule } from '@/infrastructure';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { config, configValidationSchema } from '@/config';
import { DeviceInfoMiddleware } from '@/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { SharedModule } from '@/shared';
import { MODULES } from '@/modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [() => config],
      validationOptions: {
        abortEarly: true,
      },
    }),
    SharedModule,
    PrismaModule,
    AppCacheModule,
    AppLoggerModule,
    AppQueueModule,
    ...MODULES,
  ],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceInfoMiddleware).forRoutes('*');
  }
}
