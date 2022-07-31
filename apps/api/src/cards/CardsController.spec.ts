import { prisma } from '../prismaClient';
import { Board, Column, User } from '@prisma/client';
import { TestCase } from '../utils/TestCase';
import dependencies from '../dependencies';
import {CARD_FOCUS_EVENT_NAME, CARD_UPDATED_EVENT_NAME} from '@retro-tool/api-interfaces';

jest.mock('../dependencies', () => ({
  namespaceService: {
    setIO: () => ({
      start: jest.fn(),
    }),
    sendEventToUser: jest.fn(),
    sendEventToBoard: jest.fn(),
  },
}));

const mockDependencies = dependencies as jest.Mocked<typeof dependencies>;

describe('CardsController', () => {
  let board: Board;
  let column: Column;
  let user: User;
  let anotherUser: User;
  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        email: 'test@email.com',
        githubNickname: 'testUser',
        avatar: 'test-avatar',
      },
    });
    anotherUser = await prisma.user.create({
      data: {
        email: 'another-user@email.com',
        githubNickname: 'anotherUser',
        avatar: 'another-test-avatar',
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

      const response = await TestCase.make().actingAs(user).get(`/cards?columnId=${column.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.cards).toEqual(
        expect.arrayContaining([expect.objectContaining(card1), expect.objectContaining(card2)]),
      );
      expect(response.body.cards).not.toEqual(expect.arrayContaining([expect.objectContaining(card3)]));
    });

    it('will list cards under parent', async () => {
      await prisma.column.create({
        data: { title: 'other column', boardId: board.id, order: 1 },
      });

      const card1 = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content',
          order: 1,
        },
      });

      const card2 = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
          parentId: card1.id,
        },
      });

      const response = await TestCase.make().actingAs(user).get(`/cards?columnId=${column.id}&parentId=${card1.id}`);

      expect(response.status).toEqual(200);
      expect(response.body.cards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: card2.id,
          }),
        ]),
      );
      expect(response.body.cards).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: card1.id,
          }),
        ]),
      );
    });

    it('will list all the published cards for a column', async () => {
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
      const draftCard = {
        ownerId: anotherUser.id,
        columnId: column.id,
        content: 'random-content',
        order: 3,
        draft: true,
      };

      await prisma.card.createMany({
        data: [card1, card2, draftCard],
      });

      const response = await TestCase.make().actingAs(user).get(`/cards?columnId=${column.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.cards).toEqual(
        expect.arrayContaining([expect.objectContaining(card1), expect.objectContaining(card2)]),
      );
      expect(response.body.cards).not.toEqual(expect.arrayContaining([expect.objectContaining(draftCard)]));
    });
    it('will list all the draft owned cards for a column', async () => {
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
      const draftCard = {
        ownerId: user.id,
        columnId: column.id,
        content: 'random-content',
        order: 3,
        draft: true,
      };

      await prisma.card.createMany({
        data: [card1, card2, draftCard],
      });

      const response = await TestCase.make().actingAs(user).get(`/cards?columnId=${column.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.cards).toEqual(
        expect.arrayContaining([
          expect.objectContaining(card1),
          expect.objectContaining(card2),
          expect.objectContaining(draftCard),
        ]),
      );
    });
  });
  describe('create', () => {
    it('will create a card', async () => {
      const payload = {
        columnId: column.id,
        content: 'this is some content',
      };

      const response = await TestCase.make().actingAs(user).post('/cards').send(payload);

      expect(response.status).toEqual(200);
      expect(response.body.card).toEqual(expect.objectContaining(payload));
      expect(await prisma.card.findFirst({ where: payload })).toBeDefined();
      expect(mockDependencies.namespaceService.sendEventToBoard).toHaveBeenCalled();
      expect(mockDependencies.namespaceService.sendEventToUser).not.toHaveBeenCalled();
    });

    it('will create a card in draft state', async () => {
      const payload = {
        columnId: column.id,
        content: 'this is some content',
        draft: true,
      };

      const response = await TestCase.make().actingAs(user).post('/cards').send(payload);

      expect(response.status).toEqual(200);
      expect(response.body.card).toEqual(expect.objectContaining(payload));
      expect(await prisma.card.findFirst({ where: payload })).toBeDefined();
      expect(mockDependencies.namespaceService.sendEventToUser).toHaveBeenCalled();
      expect(mockDependencies.namespaceService.sendEventToBoard).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('will update a card', async () => {
      const card = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
        },
      });

      const payload = { content: 'updated-content' };

      const response = await TestCase.make().actingAs(user).post(`/cards/${card.id}`).send({ payload });

      expect(response.status).toEqual(200);
      expect(await prisma.card.findFirst({ where: { id: card.id } })).toEqual(expect.objectContaining(payload));
    });

    it('will update a draft card', async () => {
      const card = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
          draft: true,
        },
      });

      const payload = { content: 'updated-content' };

      const response = await TestCase.make().actingAs(user).post(`/cards/${card.id}`).send({ payload });

      expect(response.status).toEqual(200);

      expect(response.status).toEqual(200);
      expect(await prisma.card.findFirst({ where: { id: card.id } })).toEqual(expect.objectContaining(payload));
      expect(mockDependencies.namespaceService.sendEventToUser).toHaveBeenCalled();
      expect(mockDependencies.namespaceService.sendEventToBoard).not.toHaveBeenCalled();
    });
  });
  describe('vote', () => {
    it('will increment a card vote', async () => {
      const card = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
          votes: 3,
        },
      });

      const response = await TestCase.make().actingAs(user).post(`/cards/${card.id}/vote`).send({ increment: true });

      expect(response.status).toEqual(200);
      expect(await prisma.card.findFirst({ where: { id: card.id } })).toEqual(expect.objectContaining({ votes: 4 }));
    });

    it('will decrement a card vote', async () => {
      const card = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
          votes: 3,
        },
      });

      const response = await TestCase.make().actingAs(user).post(`/cards/${card.id}/vote`).send({ increment: false });

      expect(response.status).toEqual(200);
      expect(await prisma.card.findFirst({ where: { id: card.id } })).toEqual(expect.objectContaining({ votes: 2 }));
    });
  });
  describe('delete', () => {
    it('can delete a card', async () => {
      const card = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
        },
      });

      const response = await TestCase.make().actingAs(user).delete(`/cards/${card.id}`);

      expect(response.status).toEqual(200);
      expect(await prisma.card.findFirst({ where: { id: card.id } })).toBeFalsy();
    });
  });

  describe('focus', () => {
    it('can focus a card', async () => {
      const sendEventToBoardSpy = jest
        .spyOn(dependencies.namespaceService, 'sendEventToBoard')
        .mockImplementation(jest.fn());

      const card = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
        },
      });

      const response = await TestCase.make().actingAs(user).post(`/cards/${card.id}/focusCard`);

      expect(response.status).toEqual(200);

      expect(sendEventToBoardSpy).toHaveBeenCalledWith(board.id, {
        type: CARD_FOCUS_EVENT_NAME,
        payload: expect.objectContaining({ id: card.id }),
      });
    });
  });

  describe('bulk publish', () => {
    it('will bulk update cards', async () => {
      const sendEventToBoardSpy = jest
        .spyOn(dependencies.namespaceService, 'sendEventToBoard')
        .mockImplementation(jest.fn());

      const card1 = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          order: 2,
        },
      });
      const card2 = await prisma.card.create({
        data: {
          ownerId: user.id,
          columnId: column.id,
          content: 'random-content2',
          draft: true,
          order: 2,
        },
      });

      const response = await TestCase.make().actingAs(user).post('/bulk/cards/publish');

      expect(response.status).toEqual(200);
      expect((await prisma.card.findFirst({ where: { id: card2.id } })).draft).toEqual(false);
      expect(sendEventToBoardSpy).toHaveBeenCalledWith(board.id, {
        type: CARD_UPDATED_EVENT_NAME,
        payload: expect.objectContaining({ id: card2.id }),
      });
    });
  });
});
