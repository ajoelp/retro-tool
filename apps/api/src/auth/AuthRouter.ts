import { Router } from 'express';
import { AuthController } from './AuthController';
import passport from 'passport';
import { authenticatedMiddleware } from '../middleware/authMiddleware';
import { GithubStrategy } from '../utils/GithubStrategy';
import { githubStrategyCallback } from './AuthServices';

const AuthRouter = Router();
const authController = new AuthController();

/* istanbul ignore next */
passport.serializeUser(function (user, done) {
  done(null, user);
});

/* istanbul ignore next */
passport.deserializeUser(function (user, done) {
  done(null, user);
});

/* istanbul ignore next */
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    githubStrategyCallback,
  ),
);

/* istanbul ignore next */
AuthRouter.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email', 'read:org'] }),
);

/* istanbul ignore next */
AuthRouter.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    failureFlash: false,
  }),
  authController.callback,
);

AuthRouter.get('/auth/me', [authenticatedMiddleware, authController.me]);

export { AuthRouter };
