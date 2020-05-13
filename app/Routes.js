import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router';

import routes from '../app/constants/routes.json';
import App from './containers/App';
import CounterPage from './containers/CounterPage';
// const DesignerGraphEdit = lazy(() => import('./containers/designerGraphEdit'));

const DesignerGraph = lazy(() => import('./containers/designerGraph/index'));
// const DesignerGraphEdit = lazy(() => import('./containers/designerGraphEdit'));
// const DesignerGraphBlock = lazy(() =>
//   import('./containers/designerGraphBlock')
// );
const RecentOpenProject = lazy(() => import('./containers/recentOpenProject'));
// import DesignerGraphEdit from './containers/designerGraphEdit';

// import RecentOpenProject from './containers/recentOpenProject';

export default () => (
  <App>
    <Suspense
      fallback={
        <div
          style={{
            width: '100%',
            height: '100vh',
            backgroundColor: 'white',
          }}
        />
      }
    >
      <Switch>
        <Route
          exact
          path={routes.RecentOpenProject}
          component={RecentOpenProject}
        />
        <Route exact path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.DESIGNGRAPH} component={DesignerGraph} />
      </Switch>
    </Suspense>
  </App>
);
