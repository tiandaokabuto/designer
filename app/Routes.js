import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router';

import Loading from './containers/images/loading.gif';
import routes from '../app/constants/routes.json';
import App from './containers/App';

const DesignerGraph = lazy(() => import('./containers/designerGraph'));
const RecentOpenProject = lazy(() => import('./containers/recentOpenProject'));

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
        >
          <div className="loadingContent">
            <img src={Loading} alt="loading" />
            <p>正在加载主界面...</p>
          </div>
        </div>
      }
    >
      <Switch>
        <Route
          exact
          path={routes.RecentOpenProject}
          component={RecentOpenProject}
        />
        <Route path={routes.DESIGNGRAPH} component={DesignerGraph} />
      </Switch>
    </Suspense>
  </App>
);
