import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventBusService, UserCreatedEvent } from '@/modules/infrastructure/events';
import { UpdateAddressDto, UpdateUniqueNameDto } from '../dtos';
import { UsersRepository } from '../repositories';
import { PrismaError } from '@/infrastructure';
import { Prisma } from '@prisma/client';
import { UserEntity } from '@/shared';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async create(email: string, include?: Prisma.UserInclude) {
    const newUser = await this.usersRepository.create(email, include);

    this.eventBus.publish(new UserCreatedEvent(newUser.id, newUser.email, newUser.firstName));

    return newUser;
  }

  async getUserProfile(userId: string) {
    const user = await this.usersRepository.findUser({ id: userId }, { address: true });
    const userEntity = UserEntity.fromRawData(user);
    return userEntity.getProfile();
  }

  async findByEmail(email: string, include?: Prisma.UserInclude) {
    return await this.usersRepository.findUser({ email }, include);
  }

  async findUserById(id: string, include?: Prisma.UserInclude) {
    return await this.usersRepository.findUser({ id }, include);
  }

  async findUniqueName(uniqueName: string) {
    const foundUniqueName = await this.usersRepository.findUser({ uniqueName });

    return {
      available: !foundUniqueName,
    };
  }

  async updateUniqueName(dto: UpdateUniqueNameDto, userId: string) {
    try {
      const updatedUser = await this.usersRepository.updateUser(
        { id: userId },
        { uniqueName: dto.uniqueName },
      );

      const userEntity = UserEntity.fromRawData(updatedUser);

      return userEntity.getProfile();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.UniqueConstraintViolation) {
          throw new ConflictException('This unique name is already taken');
        }
      }

      throw new InternalServerErrorException('An error occurred, please try again later');
    }
  }

  async updateAddress(dto: UpdateAddressDto, userId: string) {
    const updatedUser = await this.usersRepository.updateUser(
      { id: userId },
      {
        address: {
          upsert: {
            where: { userId },
            update: {
              street: dto.street,
              city: dto.city,
              state: dto.state,
              postalCode: dto.postalCode,
            },
            create: {
              street: dto.street,
              city: dto.city,
              state: dto.state,
              postalCode: dto.postalCode,
            },
          },
        },
      },
      {
        address: true,
      },
    );

    const userEntity = UserEntity.fromRawData(updatedUser);

    return userEntity.getProfile();
  }
}
