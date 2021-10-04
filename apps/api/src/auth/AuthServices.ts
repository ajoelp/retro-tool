import { prisma } from '../prismaClient';

export const isAllowedToRegister = (organizations: string[] = []) => {
  const allowedOrgs = (process.env.ALLOWED_ORGS || '')
    .split(',')
    .filter((org) => org !== '');

  if (allowedOrgs.length <= 0) return true;
  return !!organizations.find((organization) => {
    return allowedOrgs.find((allowedOrg) => allowedOrg === organization);
  });
};

export const githubStrategyCallback = async (
  _accessToken,
  _refreshToken,
  profile,
  done,
) => {
  if (!isAllowedToRegister(profile.organizations)) {
    done(new Error('Invalid organization'), null);
    return;
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      create: {
        email: profile.email,
        githubNickname: profile.githubNickname,
        avatar: profile.avatar,
      },
      update: {
        email: profile.email,
        githubNickname: profile.githubNickname,
        avatar: profile.avatar,
      },
    });
    done(null, user);
  } catch (e) {
    done(e, null);
  }
};
