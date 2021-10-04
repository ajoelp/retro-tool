import { User } from '@prisma/client';
import { prisma } from './../prismaClient';
import { Router, Response, NextFunction } from 'express';
import { BoardsController } from './BoardsController';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import { ApiRequest } from '../types/ApiRequest';
const BoardsRouter = Router();

export const BOARDS_ROOT = '/boards';
export const BOARDS_SINGULAR = '/boards/:id';

const boardsController = new BoardsController();

export const requiredBoardOwner = async (
  req: ApiRequest,
  Response: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { id: userId } = req.user as User;
  const board = await prisma.board.findFirst({ where: { id } });
  if (!board || board.ownerId !== userId) {
    throw new Error('Must be board owner.');
  }
  next();
};

const userHasAccess = async (
  req: ApiRequest,
  Response: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { id: userId } = req.user as User;

  const boardAccess = await prisma.boardAccess.findFirst({
    where: { boardId: id, userId: userId },
  });

  if (!boardAccess) {
    throw new Error('Must be invited to board.');
  }

  next();
};

BoardsRouter.get(BOARDS_ROOT, [
  authenticatedMiddleware,
  boardsController.index,
]);
BoardsRouter.post(BOARDS_ROOT, [
  authenticatedMiddleware,
  boardsController.create,
]);
BoardsRouter.get(BOARDS_SINGULAR, [
  authenticatedMiddleware,
  userHasAccess,
  boardsController.fetch,
]);
BoardsRouter.patch(BOARDS_SINGULAR, [
  authenticatedMiddleware,
  requiredBoardOwner,
  boardsController.update,
]);
BoardsRouter.delete(BOARDS_SINGULAR, [
  authenticatedMiddleware,
  requiredBoardOwner,
  boardsController.destroy,
]);

export { BoardsRouter };
