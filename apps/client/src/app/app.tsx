import { BrowserRouter as Router, Link, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';

import Landing from './pages/Landing';
import Board from './pages/Board';
import { UserProvider } from './contexts/UserContext';
import { DialogManager } from './dialog-manager';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <DialogManager>
          <UserProvider>
            <Router>
              <div>
                <Switch>
                  <Route path="/" exact={true}>
                    <Landing />
                  </Route>
                  <Route path="/boards/:id">
                    <Board />
                  </Route>
                </Switch>
              </div>
            </Router>
          </UserProvider>
        </DialogManager>
      </ChakraProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
