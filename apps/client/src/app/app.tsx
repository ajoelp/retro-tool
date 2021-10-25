import {
  BrowserRouter as Router,
  Redirect,
  Route as BaseRoute,
  Switch,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Spinner } from '@chakra-ui/react';
import { DialogManager } from './dialog-manager';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { lazy, LazyExoticComponent, Suspense } from 'react';
import { IgnoredEventsProvider } from './contexts/IgnoredEventsContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

type AuthenticatedRouteProps = {
  path: string;
  auth?: boolean;
  exact?: boolean;
  component: LazyExoticComponent<any>;
};

const Route = (props: AuthenticatedRouteProps) => {
  const { path, exact = false, component: Component, auth = false } = props;
  const { user } = useAuth();
  return (
    <BaseRoute
      path={path}
      exact={exact}
      render={({ location }) => {
        if (auth && !user)
          return <Redirect to={`/?redirect=${location.pathname}`} />;
        return (
          <Suspense fallback={<Spinner />}>
            <Component />
          </Suspense>
        );
      }}
    />
  );
};

export const App = () => {
  return (
    <IgnoredEventsProvider>
      <QueryClientProvider client={queryClient}>
        <DialogManager>
          <AuthProvider>
            <Router>
              <Switch>
                <Route
                  path="/"
                  exact={true}
                  component={lazy(() => import('./pages/Landing'))}
                />
                <Route
                  path="/boards/:id"
                  auth={true}
                  component={lazy(() => import('./pages/Board'))}
                />
                <Route
                  path="/invites/:inviteCode"
                  auth={true}
                  component={lazy(() => import('./pages/Invite'))}
                />
              </Switch>
            </Router>
          </AuthProvider>
        </DialogManager>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </IgnoredEventsProvider>
  );
};

export default App;
