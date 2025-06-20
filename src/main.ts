import { HttpExceptionsFilter } from '@/common/filters';
import { TransformResponseInterceptor } from '@/common/interceptors';
import { AppModule } from '@/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor, PinoLogger } from 'nestjs-pino';
import { useContainer } from 'class-validator';
import compression from 'compression';
// import './instrument';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
    bodyParser: true,
  });

  const config = app.get(ConfigService);
  const logger = await app.resolve(PinoLogger);

  const origin: string[] | boolean = true;

  app.setGlobalPrefix('api/v1');

  const customHeaders = [
    'x-device-id', // the client generates a device id (uuid most preferably) and passes it as a header
    'x-session-id', // the backend will generate a session id and pass it to the client, the client will then pass it back to the backend in the request header
    'x-app-version', // e.g. The version of the mystocks.africa mobile app the user is using
    'x-device-name', // e.g. "iPhone 13 Pro"
    'x-timezone', // e.g. "Africa/Lagos"
    'x-refresh-token', // the refresh token sent as a header for mobile
  ];

  // Enable CORS with more specific options
  app.enableCors({
    origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', ...customHeaders],
    credentials: true,
  });

  app.useLogger(app.get(Logger));
  app.use(compression());
  app.use(cookieParser());
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: { target: false },
    }),
  );
  app.useGlobalInterceptors(
    new LoggerErrorInterceptor(),
    new TransformResponseInterceptor(app.get(Reflector)),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.useGlobalFilters(new HttpExceptionsFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableShutdownHooks();

  // Enable swagger in local and development environments
  if (['local', 'development'].includes(config.get<string>('APP_ENV'))) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('zerocard backend api')
      .setDescription('Backend API documentation for zerocard')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: 'zerocard backend api',
      customCss: `
        .swagger-ui .models { display: none !important; }
        .swagger-ui .opblock-tag-section.is-open .opblock-tag-section__content { display: block; }
      `,
    });
  }

  const port = config.get<number>('app.port', 3000);

  await app.listen(port, () => {
    logger.info(`🚀 zerocard backend api is running on PORT ${port}`);
  });
}
bootstrap();
