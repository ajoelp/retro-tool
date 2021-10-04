import { prisma } from '../prismaClient';
import * as AuthServices from './AuthServices';

describe('AuthServices', () => {
  describe('isAllowedToRegister', () => {
    it.each([
      ['return true with single org', 'testorg', ['testorg'], true],
      ['return false with empty orgs', 'testorg', undefined, false],
      ['return true when env is empty', '', ['testorg'], true],
      [
        'return true with multiple org in env',
        'testorg',
        ['testorg', 'org2'],
        true,
      ],
      [
        'return true with single org not in env',
        'testorg,org2',
        ['testorg'],
        true,
      ],
    ])('will %s', (_, allowedOrgs, orgs, result) => {
      process.env.ALLOWED_ORGS = allowedOrgs;
      expect(AuthServices.isAllowedToRegister(orgs)).toEqual(result);
    });
  });

  describe('githubStrategyCallback', () => {
    const profileResponse = {
      email: 'test@example.com',
      githubNickname: 'githubNickname',
      avatar: 'avatar',
      organizations: ['testorg'],
    };

    it('will return an error if user is not allowed to register', async () => {
      const mockIsAllowedToRegister = jest
        .spyOn(AuthServices, 'isAllowedToRegister')
        .mockReturnValueOnce(false);
      const done = jest.fn();

      await AuthServices.githubStrategyCallback(
        'token',
        'refreshToken',
        profileResponse,
        done,
      );

      expect(mockIsAllowedToRegister).toHaveBeenCalledTimes(1);
      expect(mockIsAllowedToRegister).toHaveBeenCalledWith(
        profileResponse.organizations,
      );

      expect(done).toHaveBeenCalledWith(expect.any(Error), null);
    });

    it('will create a user when one does not exist', async () => {
      jest.spyOn(AuthServices, 'isAllowedToRegister').mockReturnValueOnce(true);
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
      jest.spyOn(AuthServices, 'isAllowedToRegister').mockReturnValueOnce(true);
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
      jest.spyOn(AuthServices, 'isAllowedToRegister').mockReturnValueOnce(true);
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
