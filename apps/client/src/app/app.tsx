import React from 'react';
import { Layout } from './components/Layout';
import { BrowserRouter as Router, Link, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';

import Landing from './pages/Landing';
import Board from './pages/Board';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;
