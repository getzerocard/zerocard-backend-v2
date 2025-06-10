import { CompleteSignInDto, OAuthSigninDto, SignInDto } from '../dtos';
import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { OauthProvider } from '@/modules/core/auth/types';
import { AuthService } from '../services';
import { DeviceInfo } from '@/shared';
import { Request } from 'express';

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

  @Post('oauth/:provider')
  async oauth(
    @Body() dto: OAuthSigninDto,
    @Param('provider') provider: OauthProvider,
    @Req() req: Request,
  ) {
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return await this.authService.oauthSignin(provider, dto, deviceInfo);
  }
}
