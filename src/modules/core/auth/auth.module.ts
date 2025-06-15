import { UsersModule } from '@/modules/core/users';
import { OauthProviderService } from './services';
import { AuthController } from './controllers';
import { MfaModule } from '@/modules/core/mfa';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  AppleOAuthStrategy,
  AuthService,
  CookieService,
  GoogleOAuthStrategy,
  SessionService,
  TokenService,
} from './services';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_EXPIRY') },
      }),
      inject: [ConfigService],
    }),
    MfaModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    OauthProviderService,
    GoogleOAuthStrategy,
    AppleOAuthStrategy,
    SessionService,
    CookieService,
    TokenService,
    JwtStrategy,
    AuthService,
  ],
})
export class AuthModule {}
