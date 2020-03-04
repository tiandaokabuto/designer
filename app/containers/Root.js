// @flow
import React from 'react';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { InjectProvider } from 'react-hook-easier/lib/useInjectContext';
import zhCN from 'antd/es/locale/zh_CN';

import type { Store } from '../reducers/types';
import * as reduxActions from './reduxActions';
import Routes from '../Routes';

type Props = {
  store: Store,
  history: {},
};

const Root = ({ store, history }: Props) => (
  <ConfigProvider locale={zhCN}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <InjectProvider
          value={{
            history,
            ...reduxActions,
          }}
        >
          <Routes />
        </InjectProvider>
      </ConnectedRouter>
    </Provider>
  </ConfigProvider>
);

export default hot(Root);
