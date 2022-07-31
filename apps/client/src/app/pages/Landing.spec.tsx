import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Landing from './Landing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useQueryParams } from '../hooks/useQueryParams';

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

jest.mock('react-router-dom', () => {
  const initial = jest.requireActual('react-router-dom');
  return {
    ...initial,
    Navigate: jest.fn(() => <div />),
  };
});

const renderComponent = (route = '/') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Landing />
      </MemoryRouter>
    </QueryClientProvider>,
  );
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
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
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
      const button = screen.getByTestId('login-button');
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      fireEvent.click(button);

      expect(login).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logged in', () => {
    it('will redirect if query param is provided', async () => {
      const redirect = '/hello/world';
      mockUseAuth.mockReturnValueOnce({
        logoutLoading: false,
        user: {
          id: 'test-id',
          isAdmin: false,
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
          defaultColumns: null,
        },
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      act(() => {
        renderComponent(`/home?redirect=${redirect}`);
      });

      expect(Navigate).toHaveBeenCalledTimes(1);
      expect(Navigate).toHaveBeenCalledWith({ to: redirect }, {});
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
          defaultColumns: null,
        },
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      renderComponent();

      expect(await screen.findByTestId(id)).toBeInTheDocument();
    });

    it.skip('will show the admin users list', async () => {
      mockUseAuth.mockReturnValue({
        logoutLoading: false,
        user: {
          id: 'test-id',
          isAdmin: true,
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
          defaultColumns: null,
        },
        login: jest.fn(),
        logout: jest.fn(),
        userLoading: false,
      });

      renderComponent();

      expect(await screen.findByTestId('admin-users-list')).toBeInTheDocument();
    });

    it.skip('will not show the admin users list', async () => {
      mockUseAuth.mockReturnValue({
        logoutLoading: false,
        user: {
          id: 'test-id',
          isAdmin: false,
          email: 'test@example.com',
          githubNickname: 'testUser',
          avatar: '',
          defaultColumns: null,
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
