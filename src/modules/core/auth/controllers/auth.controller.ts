import { CompleteSignInDto, OAuthSigninDto, SignInDto } from '../dtos';
import { AuthService, CookieService } from '../services';
import { AuthUserEntity } from '../entities';
import { OauthProvider } from '../types';
import { AuthSwagger } from '../swagger';
import { JwtAuthGuard } from '@/common';
import { DeviceInfo } from '@/shared';
import { Request } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.signin
  signin(@Body() dto: SignInDto, @Req() req: Request) {
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return this.authService.signin(dto.email, deviceInfo);
  }

  @Post('signin/complete')
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.completeSignin
  completeSignIn(@Body() dto: CompleteSignInDto, @Req() req: Request) {
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return this.authService.completeSignIn(dto, deviceInfo);
  }

  @Post('oauth/:provider')
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.oauth
  async oauth(
    @Body() dto: OAuthSigninDto,
    @Param('provider') provider: OauthProvider,
    @Req() req: Request,
  ) {
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return await this.authService.oauthSignin(provider, dto, deviceInfo);
  }

  @Get('refresh-token')
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.refreshToken
  refreshToken(@Req() req: Request) {
    const refreshToken = this.cookieService.extractRefreshToken(req);
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return this.authService.refreshToken(refreshToken, deviceInfo);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.logout
  async logout(@Req() req: Request) {
    const user = req.user as AuthUserEntity;
    const deviceInfo = req['deviceInfo'] as DeviceInfo;

    return await this.authService.logout(user, deviceInfo);
  }
}
