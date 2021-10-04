import { Response } from 'express';
import { prisma } from '../prismaClient';
import { ApiRequest } from '../types/ApiRequest';
import { requiredBoardOwner } from './BoardsRouter';

const makeUser = (email: string, githubNickname: string) => {
  return prisma.user.create({ data: { email, githubNickname, avatar: '' } });
};
describe('BoardsRouter', () => {
  describe('requiredBoardOwner', () => {
    it('will throw an error if user is no board', async () => {
      const user = await makeUser('test1@example.com', 'test1');
      const next = jest.fn();
      const request = {
        user: user,
        params: { id: 'board1' },
      } as unknown as ApiRequest;

      expect(() =>
        requiredBoardOwner(request, {} as Response, next),
      ).rejects.toEqual(expect.any(Error));

      expect(next).not.toHaveBeenCalled();
    });

    it('will throw an error if user is not the board owner', async () => {
      const user1 = await makeUser('test1@example.com', 'test1');
      const user2 = await makeUser('test2@example.com', 'test2');
      const board = await prisma.board.create({
        data: { title: 'board1', ownerId: user1.id },
      });

      const next = jest.fn();
      const request = {
        user: user2,
        params: { id: board.id },
      } as unknown as ApiRequest;

      expect(() =>
        requiredBoardOwner(request, {} as Response, next),
      ).rejects.toEqual(expect.any(Error));

      expect(next).not.toHaveBeenCalled();
    });
  });
  beforeEach(async () => {
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
  });
});
