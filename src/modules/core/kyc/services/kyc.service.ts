import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class KycService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(KycService.name);
  }
}
