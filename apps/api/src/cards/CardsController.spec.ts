import { prisma } from '../prismaClient';
import { Board, Column, User } from '@prisma/client';
import { TestCase } from '../utils/TestCase';

describe('CardsController', () => {
  let board: Board;
  let column: Column;
  let user: User;
  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        email: 'test@email.com',
        githubNickname: 'testUser',
        avatar: 'test-avatar',
      },
    });
    board = await prisma.board.create({
      data: { title: 'new board', ownerId: user.id },
    });
    column = await prisma.column.create({
      data: {
        title: 'column',
        boardId: board.id,
        order: 1,
      },
    });
  });

  describe('list', () => {
    it('will throw an error of no columnId provided', async () => {
      const response = await TestCase.make().actingAs(user).get('/cards');
      expect(response.status).toBe(500);
    });

    it('will list all the cards for a column', async () => {
      const otherColumn = await prisma.column.create({
        data: { title: 'other column', boardId: board.id, order: 1 },
      });
      const card1 = {
        ownerId: user.id,
        columnId: column.id,
        content: 'random-content',
        order: 1,
      };
      const card2 = {
        ownerId: user.id,
        columnId: column.id,
        content: 'random-content2',
        order: 2,
      };
      const card3 = {
        ownerId: user.id,
        columnId: otherColumn.id,
        content: 'random-content',
        order: 3,
      };

      await prisma.card.createMany({
        data: [card1, card2, card3],
      });

      const response = await TestCase.make()
        .actingAs(user)
        .get(`/cards?columnId=${column.id}`);
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
      };

      const response = await TestCase.make()
        .actingAs(user)
        .post('/cards')
        .send(payload);

      expect(response.status).toEqual(200);
      expect(response.body.card).toEqual(expect.objectContaining(payload));
      expect(await prisma.card.findFirst({ where: payload })).toBeDefined();
    });
  });
});
