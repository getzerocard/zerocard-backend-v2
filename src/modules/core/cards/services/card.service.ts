import { CardInfrastructureService } from '@/modules/infrastructure/card';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ActivateCardDto, UpdateCardStatusDto } from '../dtos';
import { PrismaService } from '@/infrastructure';
import { UserCard } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { UserEntity } from '@/shared';

@Injectable()
export class CardService {
  constructor(
    private readonly infrastructureService: CardInfrastructureService,
    private readonly database: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CardService.name);
  }

  async activateCard(user: UserEntity, body: ActivateCardDto) {
    const userAddress = user.getAddress();
    const card = await this.infrastructureService.mapCard({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dateOfBirth.toISOString().split('T')[0],
      email: user.email,
      phoneNumber: user.phoneNumber,
      identity: {
        type: 'BVN',
        number: '12345678904', // TODO: Change to real BVN
      },
      address: {
        line1: userAddress.street,
        city: userAddress.city,
        state: userAddress.state,
        postalCode: userAddress.postalCode,
        country: 'Nigeria',
      },
      cardNumber: body.cardNumber,
    });

    return this.mapUserCard(card);
  }

  async getUserCard(user: UserEntity) {
    const card = await this.database.userCard.findFirst({
      where: {
        userId: user.id,
      },
    });

    return this.mapUserCard(card);
  }

  async getCardToken(user: UserEntity) {
    try {
      const card = await this.database.userCard.findFirst({
        where: {
          userId: user.id,
        },
      });

      return this.infrastructureService.getCardToken(card.sudoCardId);
    } catch (error) {
      this.logger.error('Failed to get card token', error);
      throw new InternalServerErrorException('Failed to get card token, try again later.');
    }
  }

  async freezeCard(user: UserEntity, dto: UpdateCardStatusDto) {
    try {
      const card = await this.database.userCard.findFirst({
        where: {
          userId: user.id,
        },
      });

      const updatedCard = await this.infrastructureService.freezeCard(card.sudoCardId);

      await this.database.userCard.update({
        where: {
          id: card.id,
        },
        data: {
          status: dto.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
        },
      });

      return this.mapUserCard(updatedCard);
    } catch (error) {
      this.logger.error('Failed to freeze card', error);
      throw new InternalServerErrorException('Failed to freeze card, try again later.');
    }
  }

  private async mapUserCard(card: UserCard) {
    return {
      status: card.status,
      type: card.type,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      brand: card.brand,
      currency: card.currency,
    };
  }
}
