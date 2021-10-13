import { NotFoundError } from './../errors/NotFoundError';
import { ApiRequest } from './../types/ApiRequest.d';
import { NextFunction, Response, Router } from 'express';
import { ColumnsController } from './ColumnsController';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import validateRequestParams from '../middleware/validateRequestParams';
import { prisma } from '../prismaClient';
import { AuthenticationError } from '../errors/AuthenticationError';
import { User } from '@prisma/client';

const ColumnsRouter = Router();
const columnsController = new ColumnsController();

const canViewBoard = async (req: ApiRequest, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const { id: userId } = req.user as User;

  const boardAccess = await prisma.boardAccess.findFirst({
    where: { boardId, userId },
  });

  if (!boardAccess) {
    throw new Error('Must be invited to board.');
  }

  next();
}

const canUpdateBoard = async (req: ApiRequest, res: Response, next: NextFunction) => {
  const { boardId } = req.params;

  if (!boardId) throw new Error('boardId not supplied to route');

  const board = await prisma.board.findFirst({ where: { id: boardId } })

  if (!board) throw new NotFoundError(`Board ${boardId} not found.`)

  if (board.ownerId !== req.user.id) throw new AuthenticationError('Unauthorized')

  next();
}

export const COLUMNS_ROOT = '/boards/:boardId/columns';
export const COLUMNS_SINGULAR = '/boards/:boardId/columns/:id';
export const COLUMNS_REORDER = '/boards/:boardId/columns/reorder';

ColumnsRouter.get(COLUMNS_ROOT, [
  authenticatedMiddleware,
  canViewBoard,
  validateRequestParams,
  columnsController.index,
]);

ColumnsRouter.post(COLUMNS_ROOT, [
  authenticatedMiddleware,
  canUpdateBoard,
  columnsController.create,
]);

ColumnsRouter.patch(COLUMNS_SINGULAR, [
  authenticatedMiddleware,
  canUpdateBoard,
  columnsController.update,
]);

ColumnsRouter.delete(COLUMNS_SINGULAR, [
  authenticatedMiddleware,
  canUpdateBoard,
  columnsController.destroy,
]);

ColumnsRouter.post(COLUMNS_REORDER, [
  authenticatedMiddleware,
  canUpdateBoard,
  columnsController.updateOrder,
]);

export { ColumnsRouter };
