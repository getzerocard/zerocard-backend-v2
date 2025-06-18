import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, ResponseMessage } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';
import { ActivateCardDto, UpdateCardStatusDto } from '../dtos';
import { CardService } from '../services';
import { CardSwagger } from '../swagger';

@ApiTags('Cards')
@Controller('')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardsController {
  constructor(private readonly cardService: CardService) {}

  @Post('activate')
  @CardSwagger.activate
  @ResponseMessage('Card activation successful')
  async activateCard(@Body() body: ActivateCardDto, @Req() req: Request) {
    const user = req.user as UserEntity;
    return this.cardService.activateCard(user, body);
  }

  @Get('')
  @CardSwagger.getUserCard
  @ResponseMessage('Card retrieved successfully')
  async getUserCard(@Req() req: Request) {
    const user = req.user as UserEntity;
    return this.cardService.getUserCard(user);
  }

  @Get('token')
  @CardSwagger.getCardToken
  async getCardToken(@Req() req: Request) {
    const user = req.user as UserEntity;
    return this.cardService.getCardToken(user);
  }

  @Put('staus')
  @CardSwagger.updateStatus
  @ResponseMessage('Card status updated successfully')
  async updateCardStatus(@Req() req: Request, @Body() body: UpdateCardStatusDto) {
    const user = req.user as UserEntity;
    return this.cardService.freezeCard(user, body);
  }
}
