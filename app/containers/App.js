// @flow
import * as React from 'react';
import { message, Button } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { withRouter } from 'react-router';
import event, {
  SAVE_FILE,
  START_POINT,
  STOP_RUNNING,
  REVOKE_ACTION,
  RECOVERY_ACTION,
} from '@/containers/eventCenter';
import api, { config } from '../api';
import { hex_sha1, readLoginConfig } from '../login/utils';

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
const codeblock_left = localStorage.getItem('secondLeft');
const codeblock_right = localStorage.getItem('secondRight');
const graph_left = localStorage.getItem('firstLeft');
const graph_right = localStorage.getItem('firstRight');
const zoom = localStorage.getItem('zoom');
const electronLocalshortcut = require('electron-localshortcut');
const win = remote.getCurrentWindow();

const ErrorPage = withRouter(({ history, errMessage }) => {
  return (
    <div
      style={{
        color: 'red',
      }}
    >
      {errMessage}
      <br />
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        一键恢复
      </Button>
    </div>
  );
});

class ErrorCapture extends React.Component {
  state = {
    hasError: false,
    errMessage: '',
  };
  componentDidCatch(err) {
    this.setState({
      hasError: true,
      errMessage: err.stack.toString(),
    });
  }
  render() {
    const { hasError, errMessage } = this.state;
    if (hasError) return <ErrorPage errMessage={errMessage} />;
    return this.props.children;
  }
}

export default class App extends React.Component<Props> {
  props: Props;

  componentDidMount() {
    ipcRenderer.on('updateIpAndPort', () => {
      readLoginConfig(this.resetConfig);
    });
    if (codeblock_left === null) {
      localStorage.setItem('secondLeft', '288');
    }
    if (codeblock_right === null) {
      localStorage.setItem('secondRight', '288');
    }
    if (graph_left === null) {
      localStorage.setItem('firstLeft', '288');
    }
    if (graph_right === null) {
      localStorage.setItem('firstRight', '288');
    }
    if (zoom === null) {
      localStorage.setItem('zoom', 9);
    }
    this.showReconnentTip = false;
    this.loginData = {};
    this.timerId = null;
    this.init();
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.handleOffLine);
    window.removeEventListener('online', this.handleReconnet);
    electronLocalshortcut.unregisterAll(win);
  }

  init = () => {
    window.addEventListener('offline', this.handleOffLine);
    window.addEventListener('online', this.handleReconnet);

    electronLocalshortcut.register(win, 'Ctrl+F12', () => {
      win.webContents.openDevTools();
    });
    // 保存文件快捷键
    electronLocalshortcut.register(win, 'Ctrl+S', () => {
      event.emit(SAVE_FILE);
    });
    // 运行快捷键
    electronLocalshortcut.register(win, 'F5', () => {
      event.emit(START_POINT);
    });
    // 暂停快捷键
    electronLocalshortcut.register(win, 'F12', () => {
      event.emit(STOP_RUNNING);
    });
    // 撤销快捷键
    electronLocalshortcut.register(win, 'Ctrl+Z', () => {
      event.emit(REVOKE_ACTION);
    });
    // 恢复快捷键
    electronLocalshortcut.register(win, 'Ctrl+Y', () => {
      event.emit(RECOVERY_ACTION);
    });
    // 初始化用户数据，用于断网重连
    const callback = (ip, port, userName, password, serialNumber, offLine) => {
      this.loginData.offLine = offLine;
      if (!offLine) {
        this.loginData.userName = userName;
        this.loginData.password = password;
      }
    };
    readLoginConfig(callback);

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

    // 401拦截器
    axios.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        if (error.response) {
          // 2秒后重连
          const time = 2000;
          switch (error.response.status) {
            case 401:
              // 返回 401 清除token信息并跳转到登录页面
              this.handleOffLine();
              setTimeout(this.handleReconnet, time);
              break;
            default:
              break;
          }
        }
      }
    );

    // 配置定时刷新接口
    this.refreshToken();
  };

  handleOffLine = () => {
    if (!this.showReconnentTip && !this.loginData.offLine) {
      if (this.timerId) clearInterval(this.timerId);
      this.showReconnentTip = true;
      message.info({
        content: '网络重连中...',
        key,
        duration: 0,
      });
    }
  };

  handleReconnet = () => {
    if (this.showReconnentTip && !this.loginData.offLine) {
      this.reconnet();
    }
  };

  reconnet = () => {
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
          if (this.timerId) clearInterval(this.timerId);
          return true;
        }
        return false;
      })
      .catch(err => {
        if (!this.timerId) {
          this.timerId = setInterval(this.reconnet, 10000);
        }
        console.log(err);
      });
  };

  refreshToken = () => {
    if (timerID) clearTimeout(timerID);
    fs.appendFileSync(
      `${process.cwd()}\\tokenTime.txt`,
      `${moment().format('MMMM Do YYYY, h:mm:ss a')} ${token} \r\n`,
      err => {
        if (err) {
          console.log(err);
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
    config.context = `https://${ip}:${port}`;
  };

  render() {
    const { children } = this.props;
    return <ErrorCapture>{children}</ErrorCapture>;
  }
}
