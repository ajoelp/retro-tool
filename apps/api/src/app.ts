import express, { Express } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { BoardsRouter } from './boards/BoardsRouter';
import { ColumnsRouter } from './columns/ColumnsRouter';
import { CardsRouter } from './cards/CardsRouter';
import { Server } from 'socket.io';
import http from 'http';
import { buildSockets } from './sockets';
import globalErrorMiddleware from './middleware/globalErrorMiddleware';
import { AuthRouter } from './auth/AuthRouter';
import passport from 'passport';
import helmet from 'helmet';

const expressApp = express();
const app = http.createServer(expressApp);
const io = new Server(app, {
  cors: {
    origin: '*',
  },
});

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

buildSockets(io);

expressApp.use(globalErrorMiddleware);

export { app };
