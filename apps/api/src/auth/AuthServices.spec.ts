import { prisma } from '../prismaClient';
import * as AuthServices from './AuthServices';

describe('AuthServices', () => {

  describe('githubStrategyCallback', () => {
    const profileResponse = {
      email: 'test@example.com',
      githubNickname: 'githubNickname',
      avatar: 'avatar',
      organizations: ['testorg'],
    };

    it('will create a user when one does not exist', async () => {
      const done = jest.fn();

      await AuthServices.githubStrategyCallback(
        'token',
        'refreshToken',
        profileResponse,
        done,
      );

      const user = await prisma.user.findFirst({
        where: { email: profileResponse.email },
      });
      expect(user).toBeDefined();
      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ id: user.id }),
      );
    });

    it('will return error for prisma error', async () => {
      const error = new Error('test-error');
      jest.spyOn(prisma.user, 'upsert').mockRejectedValueOnce(error);
      const done = jest.fn();

      await AuthServices.githubStrategyCallback(
        'token',
        'refreshToken',
        profileResponse,
        done,
      );

      expect(done).toHaveBeenCalledWith(error, null);
    });

    it('will update a user when one does exist', async () => {
      const done = jest.fn();

      const createdUser = await prisma.user.create({
        data: {
          email: profileResponse.email,
          githubNickname: 'blah',
          avatar: '',
        },
      });

      await AuthServices.githubStrategyCallback(
        'token',
        'refreshToken',
        profileResponse,
        done,
      );

      const user = await prisma.user.findFirst({
        where: { id: createdUser.id },
      });
      expect(user).toBeDefined();
      expect(user.email).toEqual(profileResponse.email);
      expect(user.githubNickname).toEqual(profileResponse.githubNickname);
      expect(user.avatar).toEqual(profileResponse.avatar);
      expect(done).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ id: user.id }),
      );
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
    });
  });
});
