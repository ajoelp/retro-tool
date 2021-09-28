import { prisma } from '../prismaClient';
import { TestCase } from '../utils/TestCase';

describe('InvitesController', () => {
  it('creates board access', async () => {
    const user = await prisma.user.create({
      data: { githubNickname: 'nacho', email: 'nacho@gmail.com', avatar: '' },
    });

    const board = await prisma.board.create({
      data: { title: 'new board', ownerId: user.id, inviteCode: 'our-code' },
    });

    // assert user does not have board access

    // hit endpoint
    const response = await TestCase.make()
      .actingAs(user)
      .post(`/invites/${board.inviteCode}`);

    // assert user does have board access
    expect(response.status).toEqual(200);
    expect(response.body.board).toEqual(
      expect.objectContaining({
        id: board.id,
      }),
    );

    // assert user does have board access
    const access = await prisma.boardAccess.findFirst({
      where: { userId: user.id, boardId: board.id },
    });
    expect(access).toBeTruthy();
  });
});
