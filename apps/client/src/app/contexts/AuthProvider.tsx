import { useMutation, useQuery } from 'react-query';
import { createContext, ReactNode, useContext } from 'react';
import { User } from '@prisma/client';
import api from '../api';
import { environment } from '../../environments/environment.prod';

interface LoginParams {
  email: string;
  password: string;
}

export interface AuthProviderState {
  user: User | undefined | null;
  userLoading: boolean;
  login(): void;
  logout(): Promise<any>;
  logoutLoading: boolean;
}

export const AuthContext = createContext<AuthProviderState>({
  user: null,
  userLoading: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login() { },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async logout() { },
  logoutLoading: false,
});

const useMe = () => {
  return useQuery<User>(
    ['currentUser'],
    () => {
      return api.getCurrentUser();
    },
    {
      refetchInterval: false,
      retry: false,
    },
  );
};

const useLogin = () => {
  return () => {
    window.location.href = `${environment.apiUrl}/auth/github`;
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading: userLoading } = useMe();
  const login = useLogin();

  const value: AuthProviderState = {
    user,
    userLoading,
    login,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async logout() { },
    logoutLoading: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
