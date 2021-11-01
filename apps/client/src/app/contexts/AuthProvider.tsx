import { useMutation, useQuery } from 'react-query';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { User } from '@prisma/client';
import { apiClient } from '../api';
import { environment } from '../../environments/environment.prod';
import Cookies from 'js-cookie';

interface LoginParams {
  email: string;
  password: string;
}

export interface AuthProviderState {
  user: User | undefined | null;
  userLoading: boolean;
  login(redirect?: string): void;
  logout(): Promise<any>;
  logoutLoading: boolean;
}

export const AuthContext = createContext<AuthProviderState>({
  user: null,
  userLoading: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async logout() {},
  logoutLoading: false,
});

const useMe = () => {
  return useQuery<User>(
    ['currentUser'],
    async () => {
      const { data } = await apiClient.get('/auth/me');
      return data.user as User;
    },
    {
      refetchInterval: false,
      retry: false,
    },
  );
};

const useLogin = () => {
  return (redirect = '/') => {
    window.localStorage.setItem('redirect', redirect);
    window.location.href = `${environment.apiUrl}/auth/github`;
  };
};

type ImpersonateArgs = {
  userId: User['id'];
};

export const useImporsonate = () => {
  const { mutateAsync, isLoading } = useMutation(
    async (args: ImpersonateArgs) => {
      const response = await apiClient.post(`auth/impersonate/${args.userId}`);
      Cookies.set('impersonate_token', `Bearer ${response?.data?.token}`);
      window.location.reload();
    },
  );
  return {
    impersonate: mutateAsync,
    impersonateLoading: isLoading,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading: userLoading, isFetched } = useMe();
  const login = useLogin();

  useEffect(() => {
    if (user) {
      const redirect = window.localStorage.getItem('redirect');
      if (redirect) {
        window.localStorage.removeItem('redirect');
        window.location.href = redirect;
      }
    }
  }, [user]);

  const value: AuthProviderState = {
    user,
    userLoading,
    login,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async logout() {
      if (Cookies.get('impersonate_token')) {
        Cookies.remove('impersonate_token');
      } else {
        Cookies.remove('auth_token');
      }
      window.location.reload();
    },
    logoutLoading: false,
  };

  if (!isFetched) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
