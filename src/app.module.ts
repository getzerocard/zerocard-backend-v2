import { config, configValidationSchema } from '@/config';
import { AppCacheModule, AppLoggerModule, AppQueueModule, PrismaModule } from '@/infrastructure';
import { MODULES } from '@/modules';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
    PrismaModule,
    AppCacheModule,
    AppLoggerModule,
    AppQueueModule,
    ...MODULES,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
