import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class WalletService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(WalletService.name);
  }
}
