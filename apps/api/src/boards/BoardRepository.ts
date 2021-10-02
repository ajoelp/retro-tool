import { prisma } from '../prismaClient';

export class BoardRepository {
  findById(id: string) {
    return prisma.board.findFirst({
      where: { id },
      include: {
        columns: true,
      },
    });
  }
}
