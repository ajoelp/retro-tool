import { User } from '.prisma/client';
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare namespace Express {
  export interface Request {
    user?: User;
  }
}
