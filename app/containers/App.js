// @flow
import * as React from 'react';
import { config } from '../api';

const { ipcRenderer } = require('electron');
import { readGlobalConfig } from '../login/utils';

type Props = {
  children: React.Node,
};

export default class App extends React.Component<Props> {
  props: Props;

  componentDidMount() {
    ipcRenderer.on('updateIpAndPort', () => {
      readGlobalConfig(this.resetConfig);
    });
  }

  resetConfig = (ip, port) => {
    config.context = `http://${ip}:${port}/controller`;
  };

  render() {
    const { children } = this.props;
    return <>{children}</>;
  }
}
