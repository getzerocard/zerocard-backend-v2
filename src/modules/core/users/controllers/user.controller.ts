import { Body, Controller, Get, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateAddressDto, UpdateUniqueNameDto } from '../dtos';
import { UsersService } from '../services';
import { UserSwagger } from '../swagger';
import { JwtAuthGuard } from '@/common';
import { UserEntity } from '@/shared';
import { Request } from 'express';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UserSwagger.me
  async getUser(@Req() req: Request) {
    const user = req.user as UserEntity;
    return await this.usersService.getUserProfile(user.id);
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

  @Put('address')
  @UserSwagger.updateAddress
  async updateAddress(@Req() req: Request, @Body() dto: UpdateAddressDto) {
    const user = req.user as UserEntity;
    return await this.usersService.updateAddress(dto, user.id);
  }
}
