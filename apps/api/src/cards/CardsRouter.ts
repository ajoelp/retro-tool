import {Router} from "express";
import {CardsController} from "./CardsController";
import { body, param } from "express-validator";

const CardsRouter = Router()
const cardsController = new CardsController()

CardsRouter.post('/cards', [
  body('columnId'),
  body('ownerId'),
  body('content'),
  cardsController.create
])

CardsRouter.get('/cards', [
  param('columnId'),
  cardsController.list
])

export { CardsRouter }
