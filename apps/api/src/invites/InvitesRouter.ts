import { Router } from 'express';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import { InvitesController } from './InvitesController';

const InvitesRouter = Router();
const Controller = new InvitesController();

InvitesRouter.post('/invites/:inviteCode', [
  authenticatedMiddleware,
  Controller.acceptInvite,
]);

export { InvitesRouter };
