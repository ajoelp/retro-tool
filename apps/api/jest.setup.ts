import { prisma } from './src/prismaClient';

afterAll(() => {
  prisma.$disconnect();
});
