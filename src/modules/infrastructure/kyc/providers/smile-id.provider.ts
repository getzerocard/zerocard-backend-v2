import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SmileIdProvider {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(SmileIdProvider.name);
  }
}
