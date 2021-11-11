import { User } from '@prisma/client';
import { prisma } from '../prismaClient';
import { ArgumentsOf } from 'ts-jest/dist/utils/testing';

type UserModel = typeof prisma.user;
type UpdateUserArgs = ArgumentsOf<UserModel['update']>[0]['data'];

export class UserRepository {
  updateById(id: User['id'], data: UpdateUserArgs) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
