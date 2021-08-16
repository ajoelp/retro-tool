import express, { Express } from 'express';
import cors from 'cors';
import { BoardsRouter } from './boards/BoardsRouter';
import { CategoriesRouter } from './categories/CategoriesRouter';

const app = express();

const applyMiddleware = (app: Express) => {
  /* istanbul ignore if  */
  if (process.env.NODE_ENV !== 'test') {
    app.use(cors());
  }
  app.use(express.json());
};

applyMiddleware(app);

app.use(BoardsRouter);
app.use(CategoriesRouter);

export { app };
