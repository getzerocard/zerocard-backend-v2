import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletsService } from '../services';
import { WalletsSwagger } from '../swagger';
import { PinoLogger } from 'nestjs-pino';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';

@ApiTags('Wallets')
@Controller('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WalletsController.name);
  }

  @Post('addresses')
  @WalletsSwagger.createWalletAddresses
  async createWalletAddresses(@Req() req: Request) {
    const user = req.user as UserEntity;
    const wallets = await this.walletsService.createWalletAddresses(user);
    return wallets;
  }

  @Get()
  @WalletsSwagger.getWallets
  async getWallets(@Req() req: Request) {
    const user = req.user as UserEntity;
    const wallets = await this.walletsService.getWallets(user.id);
    return wallets;
  }
}
