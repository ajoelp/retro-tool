import { BrowserRouter as Router, Link, Switch, Route as BaseRoute, Redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider, Spinner } from '@chakra-ui/react';
import { DialogManager } from './dialog-manager';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { theme } from './theme';
import { lazy, LazyExoticComponent, ReactComponentElement, Suspense } from 'react';
import '@fontsource/inter';

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
  component: LazyExoticComponent<any>
}

const Route = (props: AuthenticatedRouteProps) => {
  const { path, exact = false, component: Component, auth = false } = props
  const { user } = useAuth()
  return (
    <BaseRoute path={path} exact={exact} render={({ location }) => {
      if (auth && !user) return <Redirect to={`/?redirect=${location.pathname}`} />
      return (
        <Suspense fallback={<Spinner />}>
          <Component />
        </Suspense>
      )
    }} />
  )
}


export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <DialogManager>
          <AuthProvider>
            <Router>
              <Switch>
                <Route path="/" exact={true} component={lazy(() => import('./pages/Landing'))} />
                <Route path="/boards/:id" auth={true} component={lazy(() => import('./pages/Board'))} />
              </Switch>
            </Router>
          </AuthProvider>
        </DialogManager>
      </ChakraProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
