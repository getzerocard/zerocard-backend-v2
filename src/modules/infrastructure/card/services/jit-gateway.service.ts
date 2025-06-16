import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { AuthorizationRequestDto } from '../dtos';

@Injectable()
export class JitGatewayService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(JitGatewayService.name);
  }

  async validateSignature(signature: string) {
    const secret = this.configService.get('sudo.authorizationSecret');
    return secret === signature;
  }

  async handleAuthorizationRequest(body: AuthorizationRequestDto) {
    this.logger.info('Sudo JIT Gateway: Handling authorization request', { body });

    const { data } = body;

    const {
      customer,
      card,
      account,
      merchant,
      terminal,
      transactionMetadata,
      pendingRequest,
      verification,
      feeDetails,
    } = data;

    return true;
  }
}
