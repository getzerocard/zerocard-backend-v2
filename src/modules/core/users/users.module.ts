import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories';
import { UsersService } from './services';
import { UserController } from './controllers';

@Module({
  providers: [UsersRepository, UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
