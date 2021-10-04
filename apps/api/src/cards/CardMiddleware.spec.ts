import { prisma } from '../prismaClient';
import { ApiRequest } from '../types/ApiRequest';
import { Response } from 'express';
import { canEditCard } from './CardMiddleware';
import { Board, Card, Column, User } from '.prisma/client';

describe('CardMiddlware', () => {
  describe('canEditCard', () => {
    let user: User;
    let board: Board;
    let column: Column;
    let card: Card;

    beforeAll(async () => {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
        },
      });
      board = await prisma.board.create({
        data: { title: 'board-title', ownerId: user.id },
      });
      column = await prisma.column.create({
        data: { title: 'column-title', boardId: board.id, order: 0 },
      });
      card = await prisma.card.create({
        data: { content: '', columnId: column.id, ownerId: user.id, order: 2 },
      });
    });

    it('will continue if the user has board access', async () => {
      const request = {
        params: { cardId: card.id },
        user: user,
      } as unknown as ApiRequest;

      const response = {} as Response;
      const nextFunction = jest.fn();

      await canEditCard(request, response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('will throw an error if no cardId is found', async () => {
      const request = {
        params: {},
      } as unknown as ApiRequest;

      const response = {} as Response;
      const nextFunction = jest.fn();

      expect(() =>
        canEditCard(request, response, nextFunction),
      ).rejects.toEqual(expect.any(Error));
    });

    it('will throw an error if no card is found', async () => {
      const request = {
        params: { cardId: 'wrong-card-id' },
      } as unknown as ApiRequest;

      const response = {} as Response;
      const nextFunction = jest.fn();

      expect(() =>
        canEditCard(request, response, nextFunction),
      ).rejects.toEqual(expect.any(Error));
    });

    it('will throw an error if no user', async () => {
      const request = {
        params: { cardId: card.id },
      } as unknown as ApiRequest;

      const response = {} as Response;
      const nextFunction = jest.fn();

      expect(() =>
        canEditCard(request, response, nextFunction),
      ).rejects.toEqual(expect.any(Error));
    });

    it('will throw an error if current user is not the card owner', async () => {
      const differentOwner = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          githubNickname: 'testUser2',
          avatar: '',
        },
      });
      const cardWithWrongOwner = await prisma.card.create({
        data: {
          content: '',
          columnId: column.id,
          ownerId: differentOwner.id,
          order: 2,
        },
      });
      const request = {
        params: { cardId: cardWithWrongOwner.id },
        user,
      } as unknown as ApiRequest;

      const response = {} as Response;
      const nextFunction = jest.fn();

      expect(() =>
        canEditCard(request, response, nextFunction),
      ).rejects.toEqual(expect.any(Error));
    });
  });
});
