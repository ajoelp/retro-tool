import 'express-async-errors';
import { prisma } from './src/prismaClient';

afterAll(() => {
  prisma.$disconnect();
});
