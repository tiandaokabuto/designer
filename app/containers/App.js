// @flow
import * as React from 'react';
import api, { config } from '../api';
import { message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { ipcRenderer, remote } = require('electron');
import { readGlobalConfig } from '../login/utils';

message.config({
  maxCount: 2,
});

type Props = {
  children: React.Node,
};

let timerID = null;
const fs = require('fs');
const process = require('process');
const token = remote.getGlobal('sharedObject').token;

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
    fs.appendFileSync(
      `${process.cwd()}\\tokenTime.txt`,
      `${moment().format('MMMM Do YYYY, h:mm:ss a')} ${token} \r\n`,
      err => {
        if (err) {
          console.log(err);
        } else {
          console.log('写入成功');
        }
      }
    );
    timerID = setTimeout(() => {
      axios.get(api('refreshToken')).catch(e => {
        console.log(e);
      });
      this.refreshToken();
    }, 1000 * 60 * 2);
  };

  resetConfig = (ip, port) => {
    config.context = `http://${ip}:${port}`;
  };

  render() {
    const { children } = this.props;
    return <>{children}</>;
  }
}
