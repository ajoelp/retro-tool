import supertest from 'supertest';
import { app } from '../app';
import { User } from '@prisma/client';
import { generateJwtSecret } from './JwtService';

export class TestCase {
  private supertest: supertest.SuperTest<supertest.Test>;
  private headers: Record<string, any> = {};
  constructor() {
    this.supertest = supertest(app);
  }

  static make() {
    return new TestCase();
  }

  actingAs(user: User) {
    this.headers.Authorization = `Bearer ${generateJwtSecret(user)}`;
    return this;
  }

  post(path: string) {
    return this.supertest.post(path).set(this.headers);
  }

  get(path: string) {
    return this.supertest.get(path).set(this.headers);
  }

  put(path: string) {
    return this.supertest.put(path).set(this.headers);
  }

  patch(path: string) {
    return this.supertest.patch(path).set(this.headers);
  }

  delete(path: string) {
    return this.supertest.delete(path).set(this.headers);
  }
}
