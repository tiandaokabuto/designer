import React from 'react';
import { Button } from 'antd';

const { ipcRenderer } = require('electron');

const Login = () => {
  return (
    <div className="login">
      <div className="aside">动态更新</div>
      <div className="login-content">
        <Button
          onClick={() => {
            ipcRenderer.send('loginSuccess');
          }}
        >
          登录通过可以跳转
        </Button>
      </div>
    </div>
  );
};

export default Login;
