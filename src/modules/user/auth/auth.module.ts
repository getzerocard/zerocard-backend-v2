import { Module } from '@nestjs/common';
import { AuthService, PrivyService } from './services';

@Module({
  providers: [AuthService],
  exports: [PrivyService],
})
export class AuthModule { }
