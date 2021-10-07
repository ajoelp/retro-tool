import { Router } from 'express';
import { CardsController } from './CardsController';
import { body, query } from 'express-validator';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import validateRequestParams from '../middleware/validateRequestParams';
import { canEditCard, hasAccessToBoard } from './CardMiddleware';

const CardsRouter = Router();
const cardsController = new CardsController();

CardsRouter.post('/cards', [
  authenticatedMiddleware,
  hasAccessToBoard,
  body('columnId'),
  body('ownerId'),
  body('content'),
  validateRequestParams,
  cardsController.create,
]);

CardsRouter.post('/cards/:cardId', [
  authenticatedMiddleware,
  canEditCard,
  hasAccessToBoard,
  cardsController.update,
]);

CardsRouter.delete('/cards/:cardId', [
  authenticatedMiddleware,
  canEditCard,
  hasAccessToBoard,
  cardsController.delete,
]);

CardsRouter.get('/cards', [
  authenticatedMiddleware,
  hasAccessToBoard,
  query('columnId'),
  cardsController.list,
]);

CardsRouter.post('/cards/:cardId/vote', [
  authenticatedMiddleware,
  hasAccessToBoard,
  cardsController.vote,
]);

CardsRouter.post('/cards/:cardId/focusCard', [
  authenticatedMiddleware,
  hasAccessToBoard,
  cardsController.focus,
]);

export { CardsRouter };
