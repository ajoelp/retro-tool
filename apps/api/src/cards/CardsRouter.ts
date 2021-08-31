import { Router } from 'express';
import { CardsController } from './CardsController';
import { body, param } from 'express-validator';
import { authenticatedMiddleware } from '../middleware/authMiddleware';

const CardsRouter = Router();
const cardsController = new CardsController();

CardsRouter.post('/cards', [
  authenticatedMiddleware,
  body('columnId'),
  body('ownerId'),
  body('content'),
  cardsController.create,
]);

CardsRouter.get('/cards', [
  authenticatedMiddleware,
  param('columnId'),
  cardsController.list,
]);

export { CardsRouter };
