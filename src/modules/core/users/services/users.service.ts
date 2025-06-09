import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(email: string) {
    // TODO: create user usdc wallet, and other necessary setups
    // TODO: use a queue to handle this
    return await this.usersRepository.create(email);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findUser({ email });
  }
}
