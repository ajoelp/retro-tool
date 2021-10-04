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

    const initialAccess = await prisma.boardAccess.findFirst({
      where: { userId: user.id, boardId: board.id },
    });
    expect(initialAccess).toBeFalsy();

    const response = await TestCase.make()
      .actingAs(user)
      .post(`/invites/${board.inviteCode}`);

    expect(response.status).toEqual(200);
    expect(response.body.board).toEqual(
      expect.objectContaining({
        id: board.id,
      }),
    );

    const access = await prisma.boardAccess.findFirst({
      where: { userId: user.id, boardId: board.id },
    });
    expect(access).toBeTruthy();
  });

  it('throws when a board does not exist', async () => {
    const user = await prisma.user.create({
      data: { githubNickname: 'nacho', email: 'nacho@gmail.com', avatar: '' },
    });

    const initialAccess = await prisma.boardAccess.findFirst({
      where: { userId: user.id, boardId: 'invalid-board-id' },
    });
    expect(initialAccess).toBeFalsy();

    const response = await TestCase.make()
      .actingAs(user)
      .post(`/invites/asdasd`);

    expect(response.status).toEqual(404);
  });

  afterEach(async () => {
    await prisma.boardAccess.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
  });
});
