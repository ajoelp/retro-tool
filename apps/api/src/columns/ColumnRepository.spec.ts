import { ColumnRepository } from './ColumnRepository';
import { prisma } from '../prismaClient';
import { Board, User } from '@prisma/client';

describe('ColumnRepository', () => {
  let user: User;
  let board: Board;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        githubNickname: 'testUser',
        email: 'test@example.com',
        avatar: '',
      },
    });
    board = await prisma.board.create({
      data: {
        title: 'board',
        ownerId: user.id,
      },
    });
  });

  const columnRepository = new ColumnRepository();

  describe('getNextOrderValue', () => {
    it('it will get the next order value', async () => {
      await prisma.column.create({
        data: {
          title: 'column',
          boardId: board.id,
          order: 2,
        },
      });
      expect(await columnRepository.getNextOrderValue(board.id)).toEqual(3);
    });
  });

  describe('deleteColumns', () => {
    it("will reorder columns that don't match", async () => {
      const column1 = await prisma.column.create({
        data: {
          title: 'column',
          boardId: board.id,
          order: 0,
        },
      });
      const column2 = await prisma.column.create({
        data: {
          title: 'column',
          boardId: board.id,
          order: 1,
        },
      });
      const column3 = await prisma.column.create({
        data: {
          title: 'column',
          boardId: board.id,
          order: 3,
        },
      });
      await columnRepository.deleteColumns(board.id);

      expect(
        await prisma.column.findFirst({ where: { id: column1.id } }),
      ).toEqual(expect.objectContaining({ order: 0 }));

      expect(
        await prisma.column.findFirst({ where: { id: column2.id } }),
      ).toEqual(expect.objectContaining({ order: 1 }));

      expect(
        await prisma.column.findFirst({ where: { id: column3.id } }),
      ).toEqual(expect.objectContaining({ order: 2 }));
    });
  });

  describe('reorderColumns', () => {
    it("will reorder columns that don't match", async () => {
      const column1 = await prisma.column.create({
        data: {
          title: 'column',
          boardId: board.id,
          order: 0,
        },
      });
      const column2 = await prisma.column.create({
        data: {
          title: 'column',
          boardId: board.id,
          order: 1,
        },
      });
      const column3 = await prisma.column.create({
        data: {
          title: 'column',
          boardId: board.id,
          order: 2,
        },
      });

      await columnRepository.reorderColumns(board.id, 2, 0, 'randomId');

      expect(
        await prisma.column.findFirst({ where: { id: column1.id } }),
      ).toEqual(expect.objectContaining({ order: 1 }));

      expect(
        await prisma.column.findFirst({ where: { id: column2.id } }),
      ).toEqual(expect.objectContaining({ order: 2 }));

      expect(
        await prisma.column.findFirst({ where: { id: column3.id } }),
      ).toEqual(expect.objectContaining({ order: 0 }));
    });
  });

  afterEach(async () => {
    await prisma.column.deleteMany();
  });
});
