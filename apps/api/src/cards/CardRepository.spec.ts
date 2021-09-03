import { CardRepository } from './CardRepository';
import { prisma } from '../prismaClient';
import { Board, Column, User } from '@prisma/client';
import dependencies from '../dependencies';

const mockSendEventToBoard = jest
  .spyOn(dependencies.namespaceService, 'sendEventToBoard')
  .mockImplementation(() => {});

describe('CardRepository', () => {
  let user: User;
  let board: Board;
  let column: Column;

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
    column = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
        order: 0,
      },
    });
  });

  const cardRepository = new CardRepository();

  describe('getNextOrderValue', () => {
    it('it will get the next order value', async () => {
      await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 2,
          ownerId: user.id,
        },
      });
      expect(await cardRepository.getNextOrderValue(column.id)).toEqual(3);
    });
  });

  describe('reorderColumns', () => {
    it("will reorder cards that don't match", async () => {
      const card1 = await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 0,
          ownerId: user.id,
        },
      });
      const card2 = await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 1,
          ownerId: user.id,
        },
      });
      const card3 = await prisma.card.create({
        data: {
          content: 'card',
          columnId: column.id,
          order: 3,
          ownerId: user.id,
        },
      });
      await cardRepository.reorderCards(column.id, board.id);

      expect(await prisma.card.findFirst({ where: { id: card1.id } })).toEqual(
        expect.objectContaining({ order: 0 }),
      );

      expect(await prisma.card.findFirst({ where: { id: card2.id } })).toEqual(
        expect.objectContaining({ order: 1 }),
      );

      expect(await prisma.card.findFirst({ where: { id: card3.id } })).toEqual(
        expect.objectContaining({ order: 2 }),
      );
    });
  });

  afterEach(async () => {
    await prisma.card.deleteMany();
  });
});
