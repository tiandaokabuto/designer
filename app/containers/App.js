// @flow
import * as React from 'react';
import api, { config } from '../api';
import axios from 'axios';
import moment from 'moment';

const { ipcRenderer, remote } = require('electron');
import { readGlobalConfig } from '../login/utils';

type Props = {
  children: React.Node,
};

let timerID = null;
const fs = require('fs');

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
    fs.appendFileSync('./time.txt', `${moment().format('MMMM Do YYYY, h:mm:ss a')} ${localStorage.getItem('token')}`, err => {
      if(err) {
        console.log(err)
      } else {
        console.log('写入成功')
      }
    })
    timerID = setTimeout(() => {
      axios.get(api('refreshToken')).then(res => {
        console.log(localStorage.getItem('token'))
      }).catch(e => {
        console.log(localStorage.getItem('token'))
      });
      this.refreshToken();
    }, 60 * 1000 * 2);
  };

  resetConfig = (ip, port) => {
    config.context = `http://${ip}:${port}`;
  };

  render() {
    const { children } = this.props;
    return <>{children}</>;
  }
}
