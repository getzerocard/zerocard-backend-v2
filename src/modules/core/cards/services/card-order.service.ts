import { PrismaService } from '@/infrastructure';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@/shared';

@Injectable()
export class CardOrderService {
  constructor(private readonly database: PrismaService) {}

  async orderCard(user: UserEntity) {
    const cardOrder = await this.database.cardOrder.create({
      data: {
        user: { connect: { id: user.getId() } },
      },
    });

    // TODO: Send email to user
    return {
      status: cardOrder.status,
      createdAt: cardOrder.createdAt,
      updatedAt: cardOrder.updatedAt,
      fulfilledAt: cardOrder.fulfilledAt,
    };
  }
}
