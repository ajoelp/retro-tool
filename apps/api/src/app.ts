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
  app.use(express.json());
};

applyMiddleware(expressApp);

expressApp.use(BoardsRouter);
expressApp.use(ColumnsRouter);
expressApp.use(CardsRouter);

buildSockets(io);

expressApp.use(globalErrorMiddleware);

export { app };
