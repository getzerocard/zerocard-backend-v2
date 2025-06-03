import { Module } from '@nestjs/common';
import { AuthService } from './services';
import { RegisterController } from './controllers';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
        children: [RegisterController],
      },
    ]),
  ],
  controllers: [RegisterController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
