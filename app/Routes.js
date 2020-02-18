import React from 'react';
import { Switch, Route, Router } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import DesignerGraphEdit from './containers/designerGraphEdit';
import DesignerGraphBlock from './containers/designerGraphBlock';

export default () => (
  <App>
    <Switch>
      <Route exact={true} path={routes.COUNTER} component={CounterPage} />
      <Route
        exact={true}
        path={routes.DESIGNGRAPHEDIT}
        component={DesignerGraphEdit}
      />
      <Route
        exact={true}
        path={routes.DesignerGraphBlock}
        component={DesignerGraphBlock}
      />
    </Switch>
  </App>
);
