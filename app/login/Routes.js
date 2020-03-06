import React from 'react';
import { createHashHistory } from 'history';
import { Switch, Route, Router } from 'react-router';

import Login from './Login';

const history = createHashHistory();

export default () => (
  <Router history={history}>
    <Switch>
      <Route exact={true} path="/" component={Login} />
    </Switch>
  </Router>
);
