import {
  BrowserRouter as Router,
  Navigate,
  RouteObject,
  useLocation,
  useRoutes,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Spinner } from '@chakra-ui/react';
import { DialogManager } from './dialog-manager';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { lazy, Suspense } from 'react';
import { IgnoredEventsProvider } from './contexts/IgnoredEventsContext';
import { ColorPreferencesWrapper } from './hooks/useDarkMode';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

const Landing = lazy(() => import('./pages/Landing'));
const Admin = lazy(() => import('./pages/Admin'));
const Board = lazy(() => import('./pages/Board'));
const Invite = lazy(() => import('./pages/Invite'));
const NoMatch = lazy(() => import('./pages/NoMatch'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <Admin />
      </RequireAuth>
    ),
  },
  {
    path: '/boards/:id',
    element: (
      <RequireAuth>
        <Board />
      </RequireAuth>
    ),
  },
  {
    path: '/invites/:inviteCode',
    element: (
      <RequireAuth>
        <Invite />
      </RequireAuth>
    ),
  },
  { path: '*', element: <NoMatch /> },
];

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/?redirect=${location.pathname}`} />;
  }

  return children;
}

export const Navigation = () => {
  const element = useRoutes(routes);
  return <Suspense fallback={<Spinner />}>{element}</Suspense>;
};

export const App = () => {
  return (
    <ColorPreferencesWrapper>
      <IgnoredEventsProvider>
        <QueryClientProvider client={queryClient}>
          <DialogManager>
            <AuthProvider>
              <Router>
                <Navigation />
              </Router>
            </AuthProvider>
          </DialogManager>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </IgnoredEventsProvider>
    </ColorPreferencesWrapper>
  );
};

export default App;
