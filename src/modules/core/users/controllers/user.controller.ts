import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../services';
import { Request } from 'express';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getUser(@Req() req: Request) {
    const user = req.user as UserEntity;
  }
}
