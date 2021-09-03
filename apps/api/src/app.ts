import 'express-async-errors';
import express, { Express } from 'express';
import cors from 'cors';
import { BoardsRouter } from './boards/BoardsRouter';
import { ColumnsRouter } from './columns/ColumnsRouter';
import { CardsRouter } from './cards/CardsRouter';
import { Server } from 'socket.io';
import http from 'http';
import globalErrorMiddleware from './middleware/globalErrorMiddleware';
import { AuthRouter } from './auth/AuthRouter';
import passport from 'passport';
import helmet from 'helmet';
import dependencies from './dependencies';

const expressApp = express();

const applyMiddleware = (app: Express) => {
  /* istanbul ignore if  */
  if (process.env.NODE_ENV !== 'test') {
    app.use(cors());
  }
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.json());
  app.use(helmet());
};

applyMiddleware(expressApp);

expressApp.use(BoardsRouter);
expressApp.use(ColumnsRouter);
expressApp.use(CardsRouter);
expressApp.use(AuthRouter);

expressApp.use(globalErrorMiddleware);

const app = http.createServer(expressApp);
const io = new Server(app, {
  cors: {
    origin: '*',
  },
});

dependencies.namespaceService.setIO(io).start();

export { app };
