import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';
import { ActivateCardDto } from '../dtos';
import { CardService } from '../services';

@ApiTags('Cards')
@Controller('cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardsController {
  constructor(private readonly cardService: CardService) {}

  @Post('activate')
  async activateCard(@Body() body: ActivateCardDto, @Req() req: Request) {
    const user = req.user as UserEntity;
    // return this.cardService.activateCard(user, body);
  }
}
