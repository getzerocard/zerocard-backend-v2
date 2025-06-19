import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CardOrdersSwagger } from '../swagger';
import { CardOrderService } from '../services';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';

@ApiTags('Cards')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardOrdersController {
  constructor(private readonly orderService: CardOrderService) {}

  @Post('')
  @CardOrdersSwagger.orderCard
  async orderCard(@Req() req: Request) {
    const user = req.user as UserEntity;
    return this.orderService.orderCard(user);
  }
}
