import { EventBusService, UserCreatedEvent } from '@/modules/infrastructure/events';
import { UsersRepository } from '../repositories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async create(email: string) {
    const newUser = await this.usersRepository.create(email);
    this.eventBus.publish(new UserCreatedEvent(newUser.id, newUser.email, newUser.firstName));
    return newUser;
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

  async updateUser() {}
}
