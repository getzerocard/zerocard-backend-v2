import { JitGatewayWebhookEvent } from '@/modules/infrastructure/card/types';
import { RatesService } from '@/modules/infrastructure/rates';
import { PrismaService } from '@/infrastructure';
import { ConfigService } from '@nestjs/config';
import { JitGatewayEventDto } from '../dtos';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { WalletEntity } from '@/shared';

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

  async handleJitGatewayEvent(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling event', { body });

    const { event } = body;

    switch (event) {
      case JitGatewayWebhookEvent.AUTHORIZATION_REQUEST:
        break;
      case JitGatewayWebhookEvent.AUTHORIZATION_DECLINED:
        break;
      case JitGatewayWebhookEvent.TRANSACTION_CREATED:
        break;
      case JitGatewayWebhookEvent.CARD_BALANCE:
        break;
    }

    // const {
    //   customer,
    //   card,
    //   account,
    //   merchant,
    //   terminal,
    //   transactionMetadata,
    //   pendingRequest,
    //   verification,
    //   feeDetails,
    // } = data;

    return true;
  }

  private async getUserWallet(userId: string): Promise<WalletEntity> {
    const wallet = await this.prismaService.wallet.findFirst({
      where: {
        ownerId: userId,
        isActive: true,
      },
      include: {
        balances: {
          include: {
            token: true,
          },
        },
      },
    });

    const walletEntity = WalletEntity.fromRawData(wallet);

    return walletEntity;
  }

  private async handleAuthorizationRequest(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling authorization request', { body });
  }

  private async handleAuthorizationDeclined(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling authorization declined', { body });
  }

  private async handleTransactionCreated(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling transaction created', { body });
  }

  private async handleCardBalance(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling card balance', { body });
    const sudoCustomer = await this.prismaService.sudoCustomer.findFirst({
      where: {
        customerId: body.data.customer.id,
      },
    });

    if (!sudoCustomer) {
      this.logger.error('Sudo JIT Gateway: Customer not found', { body });
      return;
    }

    const wallet = await this.getUserWallet(sudoCustomer.userId);

    if (!wallet) {
      this.logger.error('Sudo JIT Gateway: Wallet not found', { body });
      return;
    }

    const balances = wallet.getBalances();
  }
}
