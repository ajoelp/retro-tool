import { ApiRequest } from './../types/ApiRequest.d';
import { Response } from 'express';
import { generateJwtSecret } from '../utils/JwtService';
import { User } from '@prisma/client';
import { prisma } from '../prismaClient';

export class AuthController {
  async me(req: ApiRequest, res: Response) {
    return res.json({ user: req.user });
  }

  async callback(req: ApiRequest, res: Response) {
    return res
      .cookie('auth_token', `Bearer ${generateJwtSecret(req.user as User)}`, {
        expires: new Date(Date.now() + 48 * 3600000),
        domain: process.env.COOKIE_DOMAIN,
      })
      .redirect(301, process.env.SPA_URL);
  }

  async impersonate(req: ApiRequest, res: Response) {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found.');
    }

    return res.json({ token: generateJwtSecret(user) });
  }
}
