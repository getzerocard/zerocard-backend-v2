import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories';
import { UsersService } from './services';

@Module({
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule { }
