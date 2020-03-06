import React from 'react';
import { Button, Input } from 'antd';

const { ipcRenderer } = require('electron');

import './login.scss';

const Login = () => {
  return (
    <div className="login">
      <div
        className="login-left"
        style={{
          WebkitAppRegion: 'drag',
        }}
      ></div>
      <div className="login-right">
        <div className="login-right-title">欢迎使用RPA设计器</div>
        <div className="login-right-username">
          <div>用户名</div>
          <Input placeholder="请输入用户名" />
        </div>
        <div className="login-right-password">
          <div>密码</div>
          <Input placeholder="请输入密码" />
        </div>
        <Button
          onClick={() => {
            ipcRenderer.send('loginSuccess');
          }}
        >
          登录
        </Button>
      </div>
      {/* <div className="aside">动态更新</div>
      <div className="login-content">
        <Button
          onClick={() => {
            ipcRenderer.send('loginSuccess');
          }}
        >
          登录通过可以跳转
        </Button>
      </div> */}
    </div>
  );
};

export default Login;
