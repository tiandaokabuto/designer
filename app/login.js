import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';

import Login from './login/index';

const AppContainer = ReactHotAppContainer;

render(
  <AppContainer>
    <Login />
  </AppContainer>,
  document.getElementById('root')
);
