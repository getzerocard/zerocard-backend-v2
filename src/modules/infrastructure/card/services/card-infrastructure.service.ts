import { MapCardParams, CreateCustomerParams, CreateCardParams } from '../types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SudoProvider } from '../providers';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CardInfrastructureService {
  constructor(
    private readonly provider: SudoProvider,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CardInfrastructureService.name);
  }

  private async createCustomer(params: CreateCustomerParams) {
    return this.provider.createCustomer(params);
  }

  private async createCard(params: CreateCardParams) {
    return this.provider.createCard(params);
  }

  async mapCard(params: MapCardParams) {
    const customer = await this.createCustomer({
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

    const card = await this.createCard({
      customerId: customer.id,
      fundingSourceId: customer.fundingSources[0].id,
      number: params.number,
      expirationDate: params.expirationDate,
    });

    if (!card) {
      this.logger.fatal(card, 'Failed to create sudo card');
      throw new BadRequestException('Oops! Failed to activate card, try again later.');
    }

    return card;
  }
}
