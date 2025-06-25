import { JitGatewayWebhookEvent } from '@/modules/infrastructure/card/types';
import { WalletsService } from '@/modules/core/wallets/services';
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
    private readonly walletsService: WalletsService,
  ) {
    this.logger.setContext(JitGatewayService.name);
  }

  async validateSignature(signature: string) {
    const secret = this.configService.get('sudo.authorizationSecret');
    return secret === signature;
  }

  async handleJitGatewayEvent(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling event', { body });

    const { type } = body;

    switch (type) {
      case JitGatewayWebhookEvent.AUTHORIZATION_REQUEST:
        break;
      case JitGatewayWebhookEvent.AUTHORIZATION_DECLINED:
        break;
      case JitGatewayWebhookEvent.TRANSACTION_CREATED:
        break;
      case JitGatewayWebhookEvent.CARD_BALANCE:
        return await this.handleCardBalance(body);
      default:
        this.logger.error(`Sudo JIT Gateway: Invalid event type: ${type}`);
        // TODO: verify that this is the correct response
        return {
          statusCode: 400,
          responseCode: '01',
          data: {
            message: 'Invalid event type',
          },
        };
    }
  }

  private async getUserWallet(userId: string): Promise<WalletEntity[]> {
    const wallets = await this.prismaService.wallet.findMany({
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

    return wallets.map(wallet => WalletEntity.fromRawData(wallet));
  }

  private async handleAuthorizationRequest(body: JitGatewayEventDto) {
    this.logger.info(`Sudo JIT Gateway: Handling authorization request: ${body._id}`);
  }

  private async handleAuthorizationDeclined(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling authorization declined', { body });
  }

  private async handleTransactionCreated(body: JitGatewayEventDto) {
    this.logger.info('Sudo JIT Gateway: Handling transaction created', { body });
  }

  private async handleCardBalance(body: JitGatewayEventDto) {
    this.logger.info(`Sudo JIT Gateway: Handling card balance: ${body._id}`);

    const { customer } = body.data.object;

    const sudoCustomer = await this.prismaService.sudoCustomer.findFirst({
      where: {
        customerId: customer._id,
      },
    });

    if (!sudoCustomer) {
      this.logger.error(`Sudo JIT Gateway: Customer not found: ${customer._id}`);
      return;
    }

    const totalBalance = await this.walletsService.getTotalBalance(sudoCustomer.userId);

    return {
      statusCode: 200,
      responseCode: '00',
      data: {
        balance: totalBalance,
      },
    };
  }
}
