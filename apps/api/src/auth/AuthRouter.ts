import { Router } from 'express';
import { AuthController } from './AuthController';
import passport from 'passport';
import { Strategy } from 'passport-github2';
import { prisma } from '../prismaClient';
import { authenticatedMiddleware } from '../middleware/authMiddleware';

const AuthRouter = Router();
const authController = new AuthController();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const user = await prisma.user.upsert({
          where: { email: profile.emails?.[0].value },
          create: {
            email: profile.emails?.[0].value,
            githubNickname: profile.username,
            avatar: profile.photos?.[0].value,
          },
          update: {
            email: profile.emails?.[0].value,
            githubNickname: profile.username,
            avatar: profile.photos?.[0].value,
          },
        });
        done(null, user);
      } catch (e) {
        done(e, null);
      }
    },
  ),
);

AuthRouter.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
);

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
