import React, { useState, useEffect } from 'react';
import { Button, Checkbox, message } from 'antd';
import axios from 'axios';

import api, { config } from '../api';
import { hex_sha1, readGlobalConfig, writeGlobalConfig } from './utils';
import LoginFromInput from './components/LoginFromInput';

const { ipcRenderer, remote } = require('electron');

import './login.scss';

const SERIAL_NUMBER_POSSWORK = hex_sha1('2020-12-31');
console.log(SERIAL_NUMBER_POSSWORK);

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState(undefined);

  // 保存设置的 IP 和 端口
  const [ip, setIp] = useState(undefined);
  const [port, setPort] = useState(undefined);

  // 保存离线登录的序列号和状态
  const [serialNumber, setSerialNumber] = useState('');
  const [offLine, setOffLine] = useState(false);
  const [isClickOfffLine, setIsClickOfffLine] = useState(false);
  const [liscense, setLiscense] = useState(true);

  const LOGIN_ONLINE = !offLine
    ? [
        {
          key: 'name',
          inputValue: userName,
          handleInputVauleChange: setUserName,
          label: '登录账号',
          placeholder: '请输入登录账号',
          formItemClassName: 'login-right-username',
        },
        {
          key: 'password',
          inputValue: password,
          handleInputVauleChange: setPassword,
          type: 'password',
          label: '密码',
          placeholder: '请输入密码',
          formItemClassName: 'login-right-password',
        },
        {
          key: 'ip',
          inputValue: ip,
          handleInputVauleChange: setIp,
          label: 'IP',
          placeholder: '请输入IP',
        },
        {
          key: 'port',
          inputValue: port,
          handleInputVauleChange: setPort,
          label: '端口',
          placeholder: '请输入端口',
        },
      ]
    : [
        {
          key: 'serialNumber',
          inputValue: serialNumber,
          handleInputVauleChange: setSerialNumber,
          label: '序列号',
          placeholder: '请输入序列号',
          formItemClassName: 'login-right-username',
        },
      ];

  const handleSignIn = () => {
    if (offLine) {
      remote.getGlobal('sharedObject').userName = '';
      ipcRenderer.send('loginSuccess');
    }
    axios
      .post(api('signIn'), {
        userName,
        password: hex_sha1(password),
      })
      .then(json => {
        if (json.code !== -1) {
          remote.getGlobal('sharedObject').token = json.data.token;
          remote.getGlobal('sharedObject').userName = json.data.roleName;
          ipcRenderer.send('loginSuccess');
          return true;
        }
        return false;
      })
      .catch(err => console.log(err));
  };

  const handleClickOffLine = () => {
    setOffLine(!offLine);
    setIsClickOfffLine(true);
  };

  const handleClickSignIn = () => {
    if (offLine && serialNumber !== SERIAL_NUMBER_POSSWORK) {
      message.error('序列号错误');
      return;
    }
    config.context = `http://${ip}:${port}`;
    writeGlobalConfig({
      ip,
      port,
      userName,
      password,
      serialNumber,
      offLine,
    });
    handleSignIn();
  };

  useEffect(() => {
    if (isClickOfffLine && offLine) {
      handleClickSignIn();
    }
  }, [isClickOfffLine, offLine]);

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
      () => {
        message.error('ip或端口配置错误');
      }
    );
  }, []);

  useEffect(() => {
    const callback = (
      ip,
      port,
      userName,
      password,
      serialNumberFromFile,
      OffLineFromFile
    ) => {
      setIp(ip);
      setPort(port);
      setUserName(userName);
      setPassword(password);
      setSerialNumber(serialNumberFromFile);
      const globalUserName = remote.getGlobal('sharedObject').userName;
      if (globalUserName === '') setOffLine(OffLineFromFile);
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
          serialNumber,
          offLine,
        });
        handleSignIn();
      }
    };
    return () => {
      document.onkeydown = null;
    };
  }, [config, ip, port, userName, password, serialNumber, offLine]);
  return (
    <div className="login">
      <div
        className="login-left"
        style={{
          WebkitAppRegion: 'drag',
        }}
      />
      <div className="login-right">
        <span
          className="login-right-icon-close"
          onClick={() => {
            ipcRenderer.send('close');
          }}
        >
          X
        </span>
        <div className="login-right-title">欢迎使用RPA设计器</div>
        {LOGIN_ONLINE.map(({ handleInputVauleChange, ...pops }) => (
          <LoginFromInput
            {...pops}
            handleInputVauleChange={value => handleInputVauleChange(value)}
          />
        ))}
        {offLine && (
          <p className="login-right-liscense">
            <Checkbox
              defaultChecked
              checked={liscense}
              onChange={() => setLiscense(!liscense)}
            >
              我已阅读并接受
              <span className="login-right-liscense-file">《许可协议》</span>
            </Checkbox>
          </p>
        )}
        <Button
          disabled={offLine && serialNumber === ''}
          onClick={() => {
            handleClickSignIn();
          }}
        >
          登录
        </Button>
        <Button
          type="link"
          className="login-right-offline"
          onClick={() => {
            handleClickOffLine();
          }}
        >
          {offLine ? '登录账号' : '离线使用'}
        </Button>
      </div>
    </div>
  );
};

export default Login;
