import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure';
import { ConfigService } from '@nestjs/config';
import { SudoProvider } from '../providers';
import { CardBrand } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { MapCardParams } from '../types';

@Injectable()
export class CardInfrastructureService {
  constructor(
    private readonly provider: SudoProvider,
    protected readonly logger: PinoLogger,
    private readonly database: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(CardInfrastructureService.name);
  }

  /**
   * Map card parameters to sudo card
   * @param params - The parameters to map
   * @returns The mapped card
   */
  async mapCard(params: MapCardParams) {
    const customer = await this.provider.createCustomer({
      name: `${params.firstName} ${params.lastName}`,
      phoneNumber: params.phoneNumber,
      emailAddress: params.email,
      billingAddress: {
        line1: params.address.line1,
        city: params.address.city,
        state: params.address.state,
        postalCode: params.address.postalCode,
        country: params.address.country,
      },
      individual: {
        firstName: params.firstName,
        lastName: params.lastName,
        dob: params.dob,
        identity: {
          type: params.identity.type,
          number: params.identity.number,
        },
        documents: {
          idFrontUrl: params.documents.idFrontUrl,
          idBackUrl: params.documents.idBackUrl,
        },
      },
    });

    if (!customer) {
      this.logger.fatal(customer, 'Failed to create sudo customer');
      throw new BadRequestException('Oops! Failed to activate card, try again later.');
    }

    await this.storeSudoCustomer(params.userId, customer.id);

    const card = await this.provider.createCard({
      customerId: customer.id,
      fundingSourceId: this.configService.get('sudo.fundingSourceId'), // we are using gateway funding source, already created on sudo dashboard.
      number: params.cardNumber,
      expirationDate: params.expirationDate,
    });

    if (!card) {
      this.logger.fatal(card, 'Failed to create sudo card');
      throw new BadRequestException('Oops! Failed to activate card, try again later.');
    }

    const maskedPan = card.maskedPan;
    const bin = maskedPan.slice(0, 6);
    const last4 = maskedPan.slice(-4);

    await this.storeSudoCard({
      userId: params.userId,
      sudoCardId: card.id,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      brand: card.brand,
      currency: card.currency,
      bin,
      last4,
    });

    return card;
  }

  /**
   * Get token for displaying card sensitive information
   * @param sudoCardId - The id of the sudo card
   * @returns The token for displaying card sensitive information
   */
  async getCardToken(sudoCardId: string) {
    return this.provider.getCardToken(sudoCardId);
  }

  /**
   * Freeze a card
   * @param sudoCardId - The id of the sudo card
   * @returns The updated (inactive) card
   */
  async freezeCard(sudoCardId: string) {
    return this.provider.updateCard(sudoCardId, { status: 'inactive' });
  }

  /**
   * Store sudo customer
   * @param userId - The id of the user
   * @param sudoCustomerId - The id of the sudo customer
   * @returns The stored sudo customer
   */
  private async storeSudoCustomer(userId: string, sudoCustomerId: string) {
    try {
      return await this.database.sudoCustomer.create({
        data: {
          user: { connect: { id: userId } },
          customerId: sudoCustomerId,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to store sudo customer');
    }
  }

  /**
   * Store sudo card
   * @param params - The parameters to store
   * @returns The stored sudo card
   */
  private async storeSudoCard(params: {
    userId: string;
    sudoCardId: string;
    expiryMonth: string;
    expiryYear: string;
    brand: CardBrand;
    currency: string;
    bin: string;
    last4: string;
  }) {
    try {
      return await this.database.userCard.create({
        data: {
          user: { connect: { id: params.userId } },
          sudoCardId: params.sudoCardId,
          expiryMonth: params.expiryMonth,
          expiryYear: params.expiryYear,
          brand: params.brand,
          currency: params.currency,
          bin: params.bin,
          last4: params.last4,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to store sudo card');
    }
  }
}
