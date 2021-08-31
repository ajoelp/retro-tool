import { ReactNode, useContext, useMemo, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

type UserContextState = {
  userId: string;
};

const UserContext = createContext<UserContextState>({
  userId: '',
});

type UserProviderProps = {
  children: ReactNode;
};

const USER_ID_KEY = 'userId';

export function UserProvider({ children }: UserProviderProps) {
  const userId = useMemo(() => {
    const userId = window.localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      const newUserId = uuidv4();
      window.localStorage.setItem(USER_ID_KEY, newUserId);
      return newUserId;
    }
    return userId;
  }, []);

  return (
    <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
