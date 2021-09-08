import { Router } from 'express';
import { ColumnsController } from './ColumnsController';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import { query } from 'express-validator';
import validateRequestParams from '../middleware/validateRequestParams';

const ColumnsRouter = Router();
const columnsController = new ColumnsController();

export const COLUMNS_ROOT = '/columns';
export const COLUMNS_SINGULAR = '/columns/:id';
export const COLUMNS_REORDER = '/columns/reorder';

ColumnsRouter.get(COLUMNS_ROOT, [
  authenticatedMiddleware,
  query('boardId').isString(),
  validateRequestParams,
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
ColumnsRouter.post(COLUMNS_REORDER, [
  authenticatedMiddleware,
  columnsController.updateOrder,
]);

export { ColumnsRouter };
