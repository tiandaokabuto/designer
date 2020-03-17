import React, { useState, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import axios from 'axios';

import api, { config } from '../api';
import { hex_sha1, readGlobalConfig, writeGlobalConfig } from './utils';

const { ipcRenderer, remote } = require('electron');

import './login.scss';

const Login = () => {
  const [userName, setUserName] = useState(undefined);
  const [password, setPassword] = useState(undefined);

  // 保存设置的 IP 和 端口
  const [ip, setIp] = useState(undefined);
  const [port, setPort] = useState(undefined);

  const handleSignIn = () => {
    axios
      .post(api('signIn'), {
        userName: userName,
        password: hex_sha1(password),
      })
      .then(json => {
        if (~json.code) {
          remote.getGlobal('sharedObject').token = json.data.token;
          remote.getGlobal('sharedObject').userName = json.data.userName;
          ipcRenderer.send('loginSuccess');
        }
      });
  };
  useEffect(() => {
    axios.interceptors.response.use(
      response => {
        // 如果存在返回码
        if (response && response.data.code) {
          if (response.data.code !== -1) {
            // message.success(response.data.msg);
          } else {
            message.error(response.data.message);
          }
        }
        return response.data;
      },
      err => {
        message.error('ip或端口配置错误');
      }
    );
  }, []);

  useEffect(() => {
    const callback = (ip, port, userName, password) => {
      console.log(userName, password);
      setIp(ip);
      setPort(port);
      setUserName(userName);
      setPassword(password);
    };
    readGlobalConfig(callback);
  }, []);

  useEffect(() => {
    document.onkeydown = function(e) {
      if (e.keyCode === 13) {
        config.context = `http://${ip}:${port}`;
        writeGlobalConfig({
          ip,
          port,
          userName,
          password,
        });
        handleSignIn();
      }
    };
    return () => {
      document.onkeydown = null;
    };
  }, [config, ip, port, userName, password]);
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
            value={userName}
            placeholder="请输入用户名"
            onChange={e => {
              setUserName(e.target.value);
            }}
          />
        </div>
        <div className="login-right-password">
          <div>密码</div>
          <Input
            value={password}
            placeholder="请输入密码"
            onChange={e => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <span>IP</span>
        <br />
        <Input
          placeholder="请输入IP"
          value={ip}
          onChange={e => {
            setIp(e.target.value);
          }}
        />
        <br />
        <span>端口</span>
        <br />
        <Input
          placeholder="请输入端口"
          value={port}
          onChange={e => {
            setPort(e.target.value);
          }}
        />
        <Button
          onClick={() => {
            config.context = `http://${ip}:${port}`;
            writeGlobalConfig({
              ip,
              port,
              userName,
              password,
            });
            handleSignIn();
          }}
        >
          登录
        </Button>
      </div>
    </div>
  );
};

export default Login;
