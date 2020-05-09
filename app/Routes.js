import React, { Suspense, lazy } from 'react';
import { Switch, Route, Router } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
const DesignerGraphEdit = lazy(() => import('./containers/designerGraphEdit'));
// const DesignerGraphBlock = lazy(() =>
//   import('./containers/designerGraphBlock')
// );
const RecentOpenProject = lazy(() => import('./containers/recentOpenProject'));
// import DesignerGraphEdit from './containers/designerGraphEdit';
import DesignerGraphBlock from './containers/designerGraphBlock';
// import RecentOpenProject from './containers/recentOpenProject';

export default () => (
  <App>
    <Suspense
      fallback={
        <div
          style={{
            width: '100%',
            height: '100vh',
            backgroundColor: 'skyblue',
          }}
        >
          正在跳转中...
        </div>
      }
    >
      <Switch>
        <Route
          exact={true}
          path={routes.RecentOpenProject}
          component={RecentOpenProject}
        />
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
    </Suspense>
  </App>
);
