// @flow
import * as React from 'react';
import api, { config } from '../api';
import axios from 'axios';

const { ipcRenderer, remote } = require('electron');
import { readGlobalConfig } from '../login/utils';

type Props = {
  children: React.Node,
};

let timerID = null;

export default class App extends React.Component<Props> {
  props: Props;

  componentDidMount() {
    ipcRenderer.on('updateIpAndPort', () => {
      readGlobalConfig(this.resetConfig);
    });

    this.init();
  }

  init = () => {
    axios.interceptors.request.use(
      config => {
        config.headers = {
          ...config.headers,
          'datae-token': remote.getGlobal('sharedObject').token,
        };
        return config;
      },
      error => {
        message.error('加载超时');
        return Promise.reject(error);
      }
    );
    // 配置定时刷新接口
    this.refreshToken();
  };

  refreshToken = () => {
    if (timerID) clearTimeout(timerID);
    timerID = setTimeout(() => {
      axios.get(api('refreshToken'));
      this.refreshToken();
    }, 60 * 1000 * 4);
  };

  resetConfig = (ip, port) => {
    config.context = `http://${ip}:${port}`;
  };

  render() {
    const { children } = this.props;
    return <>{children}</>;
  }
}
