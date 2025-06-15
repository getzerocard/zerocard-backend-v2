import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';

@ApiTags('Cards')
@Controller('cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardsController {
  constructor() {}

  @Post('activate')
  async activateCard(@Req() req: Request) {
    const user = req.user as UserEntity;
    // return this.cardService.activateCard(user);
  }
}
