import React, { useState, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import axios from 'axios';

import api from '../api';
import { hex_sha1 } from './utils';

const { ipcRenderer } = require('electron');

import './login.scss';

const Login = () => {
  const [userName, setUserName] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const handleSignIn = () => {
    axios
      .post(api.signIn, {
        userName: userName,
        password: hex_sha1(password),
      })
      .then(json => {
        if (~json.code) {
          ipcRenderer.send('loginSuccess');
        }
      });
  };
  useEffect(() => {
    axios.interceptors.response.use(response => {
      // 如果存在返回码
      if (response.data.code) {
        if (response.data.code !== -1) {
          // message.success(response.data.msg);
        } else {
          message.error(response.data.message);
        }
      }
      return response.data;
    });
  }, []);
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
          <Input
            placeholder="请输入用户名"
            onChange={e => {
              setUserName(e.target.value);
            }}
          />
        </div>
        <div className="login-right-password">
          <div>密码</div>
          <Input
            placeholder="请输入密码"
            onChange={e => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <Button
          onClick={() => {
            handleSignIn();
            // ipcRenderer.send('loginSuccess');
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
