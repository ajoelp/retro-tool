import { prisma } from './../../../../api/src/prismaClient';
import { PrismaClient } from '@prisma/client';

export abstract class BaseScript {
  static functionName = "undefined-functionName";
  prismaClient: PrismaClient;

  abstract run(): Promise<void>

  constructor() {
    this.prismaClient = prisma
  }

}
