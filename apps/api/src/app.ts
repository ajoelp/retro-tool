import 'express-async-errors';
import express, { Express } from 'express';
import cors from 'cors';
import { BoardsRouter } from './boards/BoardsRouter';
import { ColumnsRouter } from './columns/ColumnsRouter';
import { CardsRouter } from './cards/CardsRouter';
import { Server } from 'socket.io';
import http from 'http';
import globalErrorMiddleware, { buildError } from './middleware/globalErrorMiddleware';
import { AuthRouter } from './auth/AuthRouter';
import passport from 'passport';
import helmet from 'helmet';
import dependencies from './dependencies';
import { InvitesRouter } from './invites/InvitesRouter';
import { UsersRouter } from './users/UsersRouter';
import expressSession from 'express-session';
import { ActionItemRouter } from './action-items/ActionItemRouter';

const expressApp = express();

const applyMiddleware = (app: Express) => {
  /* istanbul ignore if  */
  if (process.env.NODE_ENV !== 'test') {
    app.use(cors());
  }

  app.use(
    expressSession({
      secret: process.env.TOKEN_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.json());
  app.use(helmet());
};

applyMiddleware(expressApp);

expressApp.get('/', (_req, res) => res.json({ status: 'ok' }));

expressApp.use(BoardsRouter);
expressApp.use(ColumnsRouter);
expressApp.use(CardsRouter);
expressApp.use(AuthRouter);
expressApp.use(InvitesRouter);
expressApp.use(UsersRouter);
expressApp.use(ActionItemRouter);

expressApp.use(globalErrorMiddleware);

const app = http.createServer(expressApp);
const io = new Server(app, {
  cors: {
    origin: '*',
  },
});

dependencies.namespaceService.setIO(io).start();

export { app };
