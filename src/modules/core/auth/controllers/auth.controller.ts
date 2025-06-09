import { Body, Controller, Post, Req } from '@nestjs/common';
import { CompleteSignInDto, SignInDto } from '../dtos';
import { AuthService } from '../services';
import { Request } from 'express';
import { DeviceInfo } from '@/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signin(@Body() dto: SignInDto) {
    return this.authService.signin(dto.email);
  }

  @Post('signin/complete')
  completeSignIn(@Body() dto: CompleteSignInDto, @Req() req: Request) {
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return this.authService.completeSignIn(dto, deviceInfo);
  }
}
