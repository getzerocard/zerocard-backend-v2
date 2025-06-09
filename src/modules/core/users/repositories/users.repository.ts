import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly database: PrismaService) {}

  async create(email: string) {
    try {
      return await this.database.user.create({
        data: {
          email,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findUser(where: Prisma.UserWhereUniqueInput) {
    return await this.database.user.findUnique({ where });
  }
}
