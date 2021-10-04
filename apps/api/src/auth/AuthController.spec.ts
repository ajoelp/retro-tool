import { TestCase } from './../utils/TestCase';
import { prisma } from '../prismaClient';
import { ApiRequest } from '../types/ApiRequest';
import { AuthController } from './AuthController';
import { Response } from 'express';
import * as JwtService from '../utils/JwtService';

class MockResponse {
  cookie() {
    return this;
  }
  redirect() {
    return this;
  }
}

describe('AuthController', () => {
  it('will get the current user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'testuser@test.com',
        githubNickname: 'testUser',
        avatar: '',
      },
    });

    const response = await TestCase.make().actingAs(user).get('/auth/me');
    expect(response.status).toEqual(200);
    expect(response.body.user).toEqual(
      expect.objectContaining({
        email: user.email,
        githubNickname: user.githubNickname,
        avatar: user.avatar,
      }),
    );
  });

  it('will respond with the jwt token for auth callback', async () => {
    process.env.COOKIE_DOMAIN = 'localhost';
    process.env.SPA_URL = 'example.com';

    jest
      .spyOn(JwtService, 'generateJwtSecret')
      .mockImplementation(() => 'testToken');

    const user = await prisma.user.create({
      data: {
        email: 'testuser@test.com',
        githubNickname: 'testUser',
        avatar: '',
      },
    });

    const request = { user } as ApiRequest;
    const response = new MockResponse() as unknown as Response;

    const cookieSpy = jest.spyOn(response, 'cookie');
    const redirectSpy = jest.spyOn(response, 'redirect');

    const controller = new AuthController();

    await controller.callback(request, response);

    expect(cookieSpy).toHaveBeenCalledWith('auth_token', `Bearer testToken`, {
      expires: expect.any(Date),
      domain: 'localhost',
    });

    expect(redirectSpy).toHaveBeenCalledWith(301, 'example.com');
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });
});
