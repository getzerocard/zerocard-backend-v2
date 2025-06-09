import { Module } from '@nestjs/common';
import { AuthService, SessionService, TokenService } from './services';
import { MfaModule } from '@/modules/core/mfa';
import { AuthController } from './controllers';

@Module({
  imports: [MfaModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, TokenService],
  exports: [],
})
export class AuthModule {}
