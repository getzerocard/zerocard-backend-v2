import { CardInfrastructureService } from '@/modules/infrastructure/card';
import { Injectable } from '@nestjs/common';
import { ActivateCardDto } from '../dtos';
import { UserEntity } from '@/shared';

@Injectable()
export class CardService {
  constructor(private readonly infrastructureService: CardInfrastructureService) {}

  async activateCard(user: UserEntity, body: ActivateCardDto) {}
}
