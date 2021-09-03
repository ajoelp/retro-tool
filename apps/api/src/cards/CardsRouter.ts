import { Router } from 'express';
import { CardsController } from './CardsController';
import { body, query } from 'express-validator';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import validateRequestParams from '../middleware/validateRequestParams';

const CardsRouter = Router();
const cardsController = new CardsController();

CardsRouter.post('/cards', [
  authenticatedMiddleware,
  body('columnId'),
  body('ownerId'),
  body('content'),
  validateRequestParams,
  cardsController.create,
]);

CardsRouter.post('/cards/:cardId', [
  authenticatedMiddleware,
  body('content'),
  cardsController.update,
]);

CardsRouter.get('/cards', [
  authenticatedMiddleware,
  query('columnId'),
  cardsController.list,
]);

export { CardsRouter };
