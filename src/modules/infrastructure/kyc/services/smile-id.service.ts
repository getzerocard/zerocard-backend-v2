import { SmileIdProvider } from '../providers';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SmileIdService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly smileIdProvider: SmileIdProvider,
  ) {
    this.logger.setContext(SmileIdService.name);
  }
}
