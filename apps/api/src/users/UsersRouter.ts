import { Router } from 'express';
import { UsersController } from './UsersController';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import { isAdminMiddleware } from '../auth/AuthServices';

const UsersRouter = Router();
const Controller = new UsersController();

UsersRouter.get('/users', [
  authenticatedMiddleware,
  isAdminMiddleware,
  Controller.index,
]);

export { UsersRouter };
