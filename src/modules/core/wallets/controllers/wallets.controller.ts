import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletsService } from '../services';
import { PinoLogger } from 'nestjs-pino';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WalletsController.name);
  }

  @Post('addresses')
  async createWalletAddresses(@Req() req: Request) {
    const user = req.user as UserEntity;
    const wallets = await this.walletsService.createWalletAddresses(user);
    return wallets;
  }

  @Get()
  async getWallets(@Req() req: Request) {
    const user = req.user as UserEntity;
    const wallets = await this.walletsService.getWallets(user.id);

    return wallets;
  }
}
