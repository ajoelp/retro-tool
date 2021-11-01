import { Board } from '@prisma/client';
import { render } from '@testing-library/react';
import BoardInfoDialog from './BoardInfoDialog';

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useLocation: jest.fn().mockReturnValue({
    origin: 'http://example.com',
  }),
}));

describe('BoardInfoDialog', () => {
  let board: Board;

  beforeEach(() => {
    board = {
      id: '123',
      title: 'Fake Retro',
      createdAt: new Date(),
      ownerId: '456',
      inviteCode: 'fake-invite-code',
    };
  });

  it('renders', () => {
    const { getByText } = render(
      <BoardInfoDialog closeDialog={jest.fn} active={false} board={board} />,
    );

    expect(getByText('Invite Members')).toBeInTheDocument();
  });

  it('renders with inviteCode', () => {
    const { getByDisplayValue } = render(
      <BoardInfoDialog closeDialog={jest.fn} active={false} board={board} />,
    );

    expect(
      getByDisplayValue('http://example.com/invites/fake-invite-code'),
    ).toBeInTheDocument();
  });

  it('saves the board-info-shown to localStorage after confirming', () => {
    const { getByText } = render(
      <BoardInfoDialog closeDialog={jest.fn} active={false} board={board} />,
    );

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    getByText('Confirm').click();

    expect(setItemSpy).toHaveBeenCalledWith(
      `board-info-shown-${board.id}`,
      'true',
    );
  });
});
