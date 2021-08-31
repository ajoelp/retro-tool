import { Router } from 'express';
import { BoardsController } from './BoardsController';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
const BoardsRouter = Router();

export const BOARDS_ROOT = '/boards';
export const BOARDS_SINGULAR = '/boards/:id';

const boardsController = new BoardsController();

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
  boardsController.update,
]);
BoardsRouter.delete(BOARDS_SINGULAR, [
  authenticatedMiddleware,
  boardsController.destroy,
]);

export { BoardsRouter };
