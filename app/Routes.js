import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import Loading from './containers/images/loading.gif';
import routes from '../app/constants/routes.json';
import App from './containers/App';

const DesignerGraph = lazy(() => import('./containers/designerGraph'));
const RecentOpenProject = lazy(() => import('./containers/recentOpenProject'));

export default () => (
  <BrowserRouter>
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
            path={routes.RECENTOPENPROJECT}
            component={RecentOpenProject}
          />
          <Route path={routes.DESIGNGRAPH} component={DesignerGraph} />
        </Switch>
      </Suspense>
    </App>
  </BrowserRouter>
);
