import { RatesService } from '@/modules/infrastructure/rates';
import { AuthorizationRequestDto } from '../dtos';
import { PrismaService } from '@/infrastructure';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class JitGatewayService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly rateService: RatesService,
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
