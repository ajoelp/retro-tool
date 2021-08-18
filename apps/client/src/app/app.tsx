import React from 'react';
import { Layout } from './components/Layout'
import { BrowserRouter as Router, Link, Switch, Route } from 'react-router-dom';
import Landing from './pages/Landing'
import Board from './pages/Board'
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export const App = () => {
  return <QueryClientProvider client={queryClient}>
  <Router>
      <div>
        <Switch>
          <Route path="/">
            <Landing />
          </Route>
          <Route path="/boards/:id">
            <Board />
          </Route>
        </Switch>
      </div>
    </Router>
  </QueryClientProvider >
  
};

export default App;
