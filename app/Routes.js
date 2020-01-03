import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import DesignerGraphEdit from './containers/designerGraphEdit/DesignerGraphEdit';

export default () => (
  <App>
    <Switch>
      <Route path={routes.COUNTER} component={CounterPage} />
      <Route path={routes.DESIGNGRAPHEDIT} component={DesignerGraphEdit} />
    </Switch>
  </App>
);
