import { Router } from 'express';
import { canUpdateBoard, canViewBoard } from '../columns/ColumnsRouter';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import { ActionItemController } from './ActionItemController';

const actionItemsController = new ActionItemController();

export const ACTION_ITEMS_ROOT = '/boards/:boardId/action-items';
export const ACTION_ITEMS_IMPORT = '/boards/:boardId/action-items-import';
export const ACTION_ITEMS_SINGULAR = '/boards/:boardId/action-items/:id';

const ActionItemRouter = Router();

ActionItemRouter.get(ACTION_ITEMS_ROOT, [authenticatedMiddleware, canViewBoard, actionItemsController.index]);

ActionItemRouter.post(ACTION_ITEMS_ROOT, [authenticatedMiddleware, canUpdateBoard, actionItemsController.create]);

ActionItemRouter.patch(ACTION_ITEMS_SINGULAR, [authenticatedMiddleware, canUpdateBoard, actionItemsController.update]);

ActionItemRouter.delete(ACTION_ITEMS_SINGULAR, [
  authenticatedMiddleware,
  canUpdateBoard,
  actionItemsController.destroy,
]);

ActionItemRouter.post(ACTION_ITEMS_IMPORT, [authenticatedMiddleware, canUpdateBoard, actionItemsController.import]);

export { ActionItemRouter };
