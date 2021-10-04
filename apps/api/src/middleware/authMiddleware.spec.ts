import { AuthenticationError } from './../errors/AuthenticationError';
import { User } from '.prisma/client';
import { Response } from 'express';
import { prisma } from '../prismaClient';
import { ApiRequest } from '../types/ApiRequest';
import { authenticatedMiddleware } from './authMiddleware';
import { generateJwtSecret } from '../utils/JwtService';

describe('authMiddleware', () => {
  let user: User;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: { email: 'test@example.com', githubNickname: 'test', avatar: '' },
    });
  });

  it('will throw an error when there is no auth header', () => {
    const request = {
      get() {
        return null;
      },
    } as unknown as ApiRequest;

    const response = {} as Response;
    const next = jest.fn();

    expect(() =>
      authenticatedMiddleware(request, response, next),
    ).rejects.toEqual(expect.any(AuthenticationError));
  });

  it('will throw an error if the user is not found', async () => {
    const request = {
      get() {
        return 'random-token-123';
      },
    } as unknown as ApiRequest;

    const response = {} as Response;
    const next = jest.fn();

    expect(() =>
      authenticatedMiddleware(request, response, next),
    ).rejects.toEqual(expect.any(AuthenticationError));
  });

  it('will continue if a user is found', async () => {
    const request = {
      get() {
        return `Bearer ${generateJwtSecret(user)}`;
      },
    } as unknown as ApiRequest;

    const response = {} as Response;
    const next = jest.fn();

    await authenticatedMiddleware(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(request.user).toEqual(expect.objectContaining({ id: user.id }));
  });
});
