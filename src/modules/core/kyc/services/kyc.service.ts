import { SmileIdService } from '@/modules/infrastructure/kyc';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class KycService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly smileIdService: SmileIdService,
  ) {
    this.logger.setContext(KycService.name);
  }
}
