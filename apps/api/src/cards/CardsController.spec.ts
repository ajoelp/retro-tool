import supertest from 'supertest';
import { app } from '../app';
import { prisma } from '../prismaClient';
import { Board, Column } from '@prisma/client';

describe('CardsController', () => {
  let board: Board;
  let column: Column;

  beforeAll(async () => {
    board = await prisma.board.create({
      data: { title: 'new board', ownerId: 'ownerId' },
    });
    column = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
      },
    });
  });

  describe('list', () => {
    it('will throw an error of no columnId provided', async () => {
      const response = await supertest(app).get('/cards');
      expect(response.status).toBe(500);
    });

    it('will list all the cards for a column', async () => {
      const otherColumn = await prisma.column.create({
        data: { title: 'other column', boardId: board.id },
      });
      const card1 = {
        ownerId: 'ownerId',
        columnId: column.id,
        content: 'random-content',
      };
      const card2 = {
        ownerId: 'ownerId',
        columnId: column.id,
        content: 'random-content2',
      };
      const card3 = {
        ownerId: 'ownerId',
        columnId: otherColumn.id,
        content: 'random-content',
      };

      await prisma.card.createMany({
        data: [card1, card2, card3],
      });

      const response = await supertest(app).get(`/cards?columnId=${column.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.cards).toEqual(
        expect.arrayContaining([
          expect.objectContaining(card1),
          expect.objectContaining(card2),
        ]),
      );
      expect(response.body.cards).not.toEqual(
        expect.arrayContaining([expect.objectContaining(card3)]),
      );
    });
  });
  describe('create', () => {
    it('will create a card', async () => {
      const payload = {
        columnId: column.id,
        content: 'this is some content',
        ownerId: 'ownerId',
      };

      const response = await supertest(app).post('/cards').send(payload);
      expect(response.status).toEqual(200);
      expect(response.body.card).toEqual(expect.objectContaining(payload));
      expect(await prisma.card.findFirst({ where: payload })).toBeDefined();
    });
  });
});
