import { UsersRepository } from '../repositories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(email: string) {
    // TODO: create user usdc wallet, and other necessary setups
    // TODO: use a queue to handle this
    return await this.usersRepository.create(email);
  }

  async getUser(userId: string) {
    const user = await this.usersRepository.findUser({ id: userId });
    // const userEntity

    return user;
  }

  async getUserProfile(userId: string) {
    const user = await this.usersRepository.findUser({ id: userId });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findUser({ email });
  }
}
