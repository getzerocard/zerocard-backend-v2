import { CompleteSignInDto, OAuthSigninDto, ResendOtpDto, SignInDto } from '../dtos';
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
  @AuthSwagger.signin
  signin(@Body() dto: SignInDto) {
    return this.authService.signin(dto.email);
  }

  @Post('signin/complete')
  @AuthSwagger.completeSignin
  completeSignIn(@Body() dto: CompleteSignInDto, @Req() req: Request) {
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return this.authService.completeSignIn(dto, deviceInfo);
  }

  @Post('oauth/:provider')
  @AuthSwagger.oauth
  async oauth(
    @Body() dto: OAuthSigninDto,
    @Param('provider') provider: OauthProvider,
    @Req() req: Request,
  ) {
    const deviceInfo = req['deviceInfo'] as DeviceInfo;
    return await this.authService.oauthSignin(provider, dto, deviceInfo);
  }

  @Get('resend-otp')
  @AuthSwagger.resendOtp
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }

  @Get('refresh-token')
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
