import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Landing from './Landing';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useQueryParams } from '../hooks/useQueryParams';
import { createMemoryHistory } from 'history';

jest.mock('../api');
jest.mock('../contexts/AuthProvider');
jest.mock('../hooks/useQueryParams');
jest.mock('../components/CreateBoardForm', () => ({
  CreateBoardForm: jest.fn(() => <div data-testid="create-board-form" />),
}));

jest.mock('../components/UserBoards', () => ({
  UserBoards: jest.fn(() => <div data-testid="user-boards" />),
}));

jest.mock('../components/AdminUsersList', () => ({
  AdminUsersList: jest.fn(() => <div data-testid="admin-users-list" />),
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  const history = createMemoryHistory();

  render(
    <QueryClientProvider client={queryClient}>
      <Router history={history}>
        <Landing />
      </Router>
    </QueryClientProvider>,
  );

  return { history };
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseQueryParams = useQueryParams as jest.MockedFunction<
  typeof useQueryParams
>;

mockUseAuth.mockReturnValue({} as any);
mockUseQueryParams.mockReturnValue({} as any);

describe('Landing Page', () => {
  describe('Login', function () {
    it('will show the login page if there is no user', async () => {
      mockUseAuth.mockReturnValue({
        logoutLoading: false,
        user: undefined,
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      renderComponent();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
    it('will login the user when the button is clicked', async () => {
      const login = jest.fn();
      mockUseAuth.mockReturnValue({
        logoutLoading: false,
        user: undefined,
        login,
        logout: jest.fn(),
        userLoading: false,
      });

      renderComponent();
      const button = screen.getByText('Login');
      expect(screen.getByText('Login')).toBeInTheDocument();
      fireEvent.click(button);

      expect(login).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logged in', () => {
    it('will redirect if query param is provided', () => {
      const redirect = '/hello/world';
      mockUseQueryParams.mockReturnValueOnce({ redirect });
      mockUseAuth.mockReturnValueOnce({
        logoutLoading: false,
        user: {
          id: 'test-id',
          isAdmin: false,
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
        },
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      const { history } = renderComponent();

      expect(history.location.pathname).toBe(redirect);
    });

    it.each([
      ['create board form', 'create-board-form'],
      ['user boards list', 'user-boards'],
    ])('will load the %s', async (_, id) => {
      mockUseAuth.mockReturnValue({
        logoutLoading: false,
        user: {
          id: 'test-id',
          isAdmin: false,
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
        },
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      renderComponent();

      expect(await screen.findByTestId(id)).toBeInTheDocument();
    });

    it('will show the admin users list', async () => {
      mockUseAuth.mockReturnValue({
        logoutLoading: false,
        user: {
          id: 'test-id',
          isAdmin: true,
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
        },
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      renderComponent();

      expect(await screen.findByTestId('admin-users-list')).toBeInTheDocument();
    });

    it('will not show the admin users list', async () => {
      mockUseAuth.mockReturnValue({
        logoutLoading: false,
        user: {
          id: 'test-id',
          isAdmin: false,
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
        },
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      renderComponent();

      expect(screen.queryByTestId('admin-users-list')).not.toBeInTheDocument();
    });
  });
});
