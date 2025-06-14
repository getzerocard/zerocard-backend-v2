import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { UpdateUniqueNameDto } from '../dtos';
import { UsersService } from '../services';
import { ApiTags } from '@nestjs/swagger';
import { UserSwagger } from '../swagger';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UserSwagger.me
  async getUser(@Req() req: Request) {
    const user = req.user as UserEntity;
    return await this.usersService.getUserProfile(user);
  }

  @Get('unique-name')
  @UserSwagger.checkUniqueName
  async findUniqueName(@Query('uniqueName') uniqueName: string) {
    return await this.usersService.findUniqueName(uniqueName);
  }

  @Patch('unique-name')
  @UserSwagger.updateUniqueName
  async updateUniqueName(@Req() req: Request, @Body() dto: UpdateUniqueNameDto) {
    const user = req.user as UserEntity;
    return await this.usersService.updateUniqueName(dto, user.id);
  }
}
