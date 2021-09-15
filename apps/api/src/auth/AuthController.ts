import { Request, Response } from 'express';
import { generateJwtSecret } from '../utils/JwtService';
import { User } from '@prisma/client';

export class AuthController {
  async me(req: Request, res: Response) {
    return res.json({ user: req.user });
  }

  async login(req: Request, res: Response) {
    return res.json({});
  }

  async callback(req: Request, res: Response) {
    return res
      .cookie('auth_token', `Bearer ${generateJwtSecret(req.user as User)}`, {
        expires: new Date(Date.now() + 48 * 3600000),
        domain: process.env.SPA_URL
      })
      .redirect(301, process.env.SPA_URL);
  }
}
