import { Router } from 'express';
import { BoardsController } from './BoardsController';
const BoardsRouter = Router();

export const BOARDS_ROOT = '/boards';
export const BOARDS_SINGULAR = '/boards/:id';

const boardsController = new BoardsController();

BoardsRouter.get(BOARDS_ROOT, boardsController.index);
BoardsRouter.post(BOARDS_ROOT, boardsController.create);
BoardsRouter.get(BOARDS_SINGULAR, boardsController.fetch);
BoardsRouter.patch(BOARDS_SINGULAR, boardsController.update);
BoardsRouter.delete(BOARDS_SINGULAR, boardsController.destroy);

export { BoardsRouter };
