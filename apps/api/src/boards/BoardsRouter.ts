import { User } from '@prisma/client';
import { prisma } from './../prismaClient';
import { Request, Router, Response, NextFunction } from 'express';
import { BoardsController } from './BoardsController';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
const BoardsRouter = Router();

export const BOARDS_ROOT = '/boards';
export const BOARDS_SINGULAR = '/boards/:id';

const boardsController = new BoardsController();

const requiredBoardOwner = async (req: Request, Response: Response, next: NextFunction) => {
  const { id } = req.params
  const { id: userId } = req.user as User
  const board = await prisma.board.findFirst({ where: { id } });
  if (!board || board.ownerId !== userId) {
    throw new Error('Must be board owner.')
  }
  next()
}

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
