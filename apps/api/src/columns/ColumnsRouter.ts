import { Router } from 'express';
import { ColumnsController } from './ColumnsController';
import { authenticatedMiddleware } from '../middleware/authMiddleware';

const ColumnsRouter = Router();
const columnsController = new ColumnsController();

export const COLUMNS_ROOT = '/columns';
export const COLUMNS_SINGULAR = '/columns/:id';

ColumnsRouter.get(COLUMNS_ROOT, [
  authenticatedMiddleware,
  columnsController.index,
]);
ColumnsRouter.post(COLUMNS_ROOT, [
  authenticatedMiddleware,
  columnsController.create,
]);
ColumnsRouter.patch(COLUMNS_SINGULAR, [
  authenticatedMiddleware,
  columnsController.update,
]);
ColumnsRouter.delete(COLUMNS_SINGULAR, [
  authenticatedMiddleware,
  columnsController.destroy,
]);

export { ColumnsRouter };
