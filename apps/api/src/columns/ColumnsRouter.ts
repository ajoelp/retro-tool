import { Router } from 'express';
import { ColumnsController } from './ColumnsController';

const ColumnsRouter = Router();
const columnsController = new ColumnsController();

export const COLUMNS_ROOT = '/columns';
export const COLUMNS_SINGULAR = '/columns/:id';

ColumnsRouter.get(COLUMNS_ROOT, columnsController.index);
ColumnsRouter.post(COLUMNS_ROOT, columnsController.create);
ColumnsRouter.patch(COLUMNS_SINGULAR, columnsController.update);
ColumnsRouter.delete(COLUMNS_SINGULAR, columnsController.destroy);

export { ColumnsRouter };
