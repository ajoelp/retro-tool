import { Board } from '@prisma/client';
import { render } from '@testing-library/react';
import BoardExportDialog from './BoardExportDialog';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn().mockReturnValue({
    getQueryData: jest.fn().mockReturnValue(null),
  }),
}));

jest.mock('../../utils/BoardToMarkdown', () => ({
  BoardToMarkdown: jest.fn().mockImplementation(() => {
    return {
      build: jest.fn().mockReturnValue('# Fake Retro'),
    };
  }),
}));

describe('BoardExportDialog', () => {
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
      <BoardExportDialog board={board} closeDialog={jest.fn} active={false} />,
    );
    expect(getByText(`${board.title} Export`)).toBeInTheDocument();
  });

  it('renders the board markdown', () => {
    const { getByText } = render(
      <BoardExportDialog board={board} closeDialog={jest.fn} active={false} />,
    );

    expect(getByText('# Fake Retro')).toBeInTheDocument();
  });
});
