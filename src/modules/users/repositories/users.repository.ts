import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure';

@Injectable()
export class UsersRepository {
  constructor(private readonly database: PrismaService) { }
}
