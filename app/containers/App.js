// @flow
import * as React from 'react';
import { message } from 'antd';
import axios from 'axios';
import moment from 'moment';

import api, { config } from '../api';
import { hex_sha1, readGlobalConfig } from '../login/utils';

const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const process = require('process');

message.config({
  maxCount: 2,
});

type Props = {
  children: React.Node,
};

let timerID = null;
const token = remote.getGlobal('sharedObject').token;
const key = 'refresh';

export default class App extends React.Component<Props> {
  props: Props;

  componentDidMount() {
    ipcRenderer.on('updateIpAndPort', () => {
      readGlobalConfig(this.resetConfig);
    });
    this.showReconnentTip = false;
    this.loginData = {};
    this.init();
    window.addEventListener('offline', this.handleOffLine);
    window.addEventListener('online', this.handleReconnet);

    // 初始化用户数据，用于断网重连
    const callback = (ip, port, userName, password, serialNumber, offLine) => {
      this.loginData.offLine = offLine;
      if (!offLine) {
        this.loginData.userName = userName;
        this.loginData.password = password;
      }
    };
    readGlobalConfig(callback);
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.handleOffLine);
    window.removeEventListener('online', this.handleReconnet);
  }

  init = () => {
    window.addEventListener('offline', () => {
      console.log('断网了');
    });
    window.addEventListener('online', () => {
      console.log('冲浪');
    });
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

  handleOffLine = () => {
    if (!this.showReconnentTip && !this.loginData.offLine) {
      this.showReconnentTip = true;
      message.loading({
        content: '网络重连中...',
        key,
        duration: 0,
      });
    }
  };

  handleReconnet = () => {
    if (this.showReconnentTip && !this.loginData.offLine) {
      axios
        .post(api('signIn'), {
          userName: this.loginData.userName,
          password: hex_sha1(this.loginData.password),
        })
        .then(json => json.data)
        .then(json => {
          if (~json.code) {
            remote.getGlobal('sharedObject').token = json.data.token;
            message.success({ content: '连接成功', key, duration: 2 });
            this.showReconnentTip = false;
            return true;
          }
          return false;
        })
        .catch(err => {
          console.log(err);
        });
    }
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
      axios.get(api('refreshToken')).catch(error => {
        console.log(error);
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
