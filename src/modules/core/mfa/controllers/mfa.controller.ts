import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SendMfaDto, VerifyMfaDto } from '../dtos';
import { MfaService } from '../services';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';

import { MfaSwagger } from '../swagger';
import { AuthUserEntity } from '@/modules/core/auth/entities';
import { Request } from 'express';

@Controller('mfa')
@ApiTags('MFA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('send')
  @MfaSwagger.send
  async send(@Body() sendDto: SendMfaDto, @Req() req: Request) {
    const user = req.user as AuthUserEntity;

    await this.mfaService.sendMfaToken(user, sendDto.context);

    return {
      message: 'MFA token sent',
    };
  }

  @Post('verify')
  @MfaSwagger.verify
  async verify(@Body() verifyDto: VerifyMfaDto, @Req() req: Request) {
    const user = req.user as AuthUserEntity;

    await this.mfaService.verifyToken(user.getEmail(), verifyDto.context, verifyDto.token);

    return {
      message: 'MFA token verified',
    };
  }
}
