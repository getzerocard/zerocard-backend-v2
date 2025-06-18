import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaError, PrismaService } from '@/infrastructure';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly database: PrismaService) {}

  async create(email: string, include?: Prisma.UserInclude) {
    try {
      return await this.database.user.create({
        data: {
          email,
        },
        include,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.UniqueConstraintViolation) {
          throw new ConflictException('A user with this email already exists already');
        }
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findUser(where: Prisma.UserWhereUniqueInput, include?: Prisma.UserInclude) {
    return await this.database.user.findUnique({ where, include });
  }

  async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    include?: Prisma.UserInclude,
  ) {
    return await this.database.user.update({ where, data, include });
  }
}
