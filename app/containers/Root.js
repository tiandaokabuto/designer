// @flow
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { InjectProvider } from 'react-hook-easier/lib/useInjectContext';

import type { Store } from '../reducers/types';
import Routes from '../Routes';

type Props = {
  store: Store,
  history: {},
};

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <InjectProvider
        value={{
          history,
        }}
      >
        <Routes />
      </InjectProvider>
    </ConnectedRouter>
  </Provider>
);

export default hot(Root);
