import { Router } from 'express';
import { CategoriesController } from './CategoriesController';

const CategoriesRouter = Router();
const categoriesController = new CategoriesController();

export const CATEGORIES_ROOT = '/categories';
export const CATEGORIES_SINGULAR = '/categories/:id';

CategoriesRouter.get(CATEGORIES_ROOT, categoriesController.index);
CategoriesRouter.post(CATEGORIES_ROOT, categoriesController.create);
CategoriesRouter.patch(CATEGORIES_SINGULAR, categoriesController.update);
CategoriesRouter.delete(CATEGORIES_SINGULAR, categoriesController.destroy);

export { CategoriesRouter };
