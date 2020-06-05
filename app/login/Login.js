import './login.scss';

import React, { useState, useEffect, useMemo } from 'react';
import { Button, Checkbox, message } from 'antd';
import axios from 'axios';

import api, { config } from '../api';
import {
  encrypt,
  hex_sha1,
  readLoginConfig,
  writeLoginConfig,
  getUserDay,
} from './utils';
import LoginFromInput from './components/LoginFromInput';

const { ipcRenderer, remote } = require('electron');

let userDay = getUserDay();
console.log(encrypt.argEncryptByDES('2020-12-31'));
console.log(encrypt.argDecryptByDES('M9XUD7OFORwK0IYcjoxebQ=='));

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState(undefined);

  // 保存设置的 IP 和 端口
  const [ip, setIp] = useState(undefined);
  const [port, setPort] = useState(undefined);

  // 保存离线登录的序列号和状态
  const [serialNumber, setSerialNumber] = useState('');
  const [liscense, setLiscense] = useState(true);
  const [offLine, setOffLine] = useState(false);

  // 是否点击切换离线状态，防止退出登录时切换成离线登录页面时发生的自动登录
  const [isClickOfffLine, setIsClickOfffLine] = useState(false);

  // 是否登录成功
  const [showTip, setShowTip] = useState(false);

  // 文件数据
  const [originFileData, setOriginFileData] = useState({});

  // 登录按钮是否可用
  const memoizedDisable = useMemo(() => {
    if (offLine) return serialNumber === '';
    return userName === '' || password === '';
  }, [offLine, serialNumber, userName, password]);

  const LOGIN_ONLINE = !offLine
    ? [
        {
          key: 'name',
          inputValue: userName,
          handleInputVauleChange: setUserName,
          label: '登录账号',
          placeholder: '请输入登录账号',
        },
        {
          key: 'password',
          inputValue: password,
          handleInputVauleChange: setPassword,
          type: 'password',
          label: '密码',
          placeholder: '请输入密码',
        },
        {
          key: 'ip',
          inputValue: ip,
          handleInputVauleChange: setIp,
          label: 'IP地址',
          placeholder: '请输入IP地址',
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
          formItemClassName: 'login-right-serial',
        },
      ];

  const checkSerialNumberValid = userSerialNumber => {
    let decryptSerialNumber = encrypt.argDecryptByDES(userSerialNumber);
    // 用户电脑上的时间
    const validSystemDay = userDay.replace(/-/g, '');
    // 序列号的时间
    decryptSerialNumber = decryptSerialNumber.replace(/-/g, '');
    if (/[^0-9]/.test(decryptSerialNumber) || decryptSerialNumber === '') {
      return false;
    }
    if (decryptSerialNumber.length === 8) {
      // 当序列号时间大于电脑时间时，返回true
      return decryptSerialNumber >= validSystemDay;
    }
    return false;
  };

  const handleSignIn = () => {
    // const currWindow = remote.getCurrentWindow();
    if (offLine) {
      remote.getGlobal('sharedObject').userName = '';
      // currWindow.hide();
      ipcRenderer.send('loginSuccess');
      setShowTip(false);
    }
    axios
      .post(api('signIn'), {
        userName,
        password: hex_sha1(password),
      })
      .then(json => {
        if (~json.code) {
          remote.getGlobal('sharedObject').token = json.data.token;
          remote.getGlobal('sharedObject').userName = json.data.roleName;
          // currWindow.hide();
          ipcRenderer.send('loginSuccess');
          setShowTip(false);
          return true;
        }
        setShowTip(true);
        return false;
      })
      .catch(err => {
        setShowTip(false);
        console.log(err);
      });
  };

  const handleClickOffLine = () => {
    setOffLine(!offLine);
    setIsClickOfffLine(true);
  };

  const checkNeedWriteConfig = newConfig => {
    let writeFlag = false;
    for (const key in newConfig) {
      if (
        Object.prototype.hasOwnProperty.call(newConfig, key) &&
        newConfig[key] !== originFileData[key]
      ) {
        writeFlag = true;
        break;
      }
    }
    return writeFlag;
  };

  const handleClickSignIn = () => {
    if (offLine && !checkSerialNumberValid(serialNumber)) {
      message.error('序列号错误');
      return false;
    } else if (offLine && !liscense) {
      message.error('未勾选许可协议');
      return false;
    }
    config.context = `http://${ip}:${port}`;
    const writeConfig = {
      ip,
      port,
      userName,
      password,
      serialNumber,
      offLine,
      userDay,
    };
    if (checkNeedWriteConfig(writeConfig)) {
      writeLoginConfig(writeConfig)
        .then(handleSignIn)
        .catch(err => console.log(err));
    } else {
      handleSignIn();
    }
  };

  useEffect(() => {
    // 点击离线登录，使用已用的序列号进行自动登录
    if (
      isClickOfffLine &&
      offLine &&
      checkSerialNumberValid(serialNumber) &&
      liscense
    ) {
      handleClickSignIn();
    }
  }, [isClickOfffLine, offLine]);

  useEffect(() => {
    axios.interceptors.response.use(
      response => response.data,
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
      OffLineFromFile,
      dateFromFile
    ) => {
      setIp(ip);
      setPort(port);
      setUserName(userName);
      setPassword(password);
      setOriginFileData({
        ip,
        port,
        userName,
        password,
        offLine,
        serialNumber,
        userDay,
      });
      if (serialNumberFromFile) setSerialNumber(serialNumberFromFile);
      const globalUserName = remote.getGlobal('sharedObject').userName;
      if (globalUserName === '') setOffLine(OffLineFromFile);
      if (dateFromFile && dateFromFile > userDay) {
        // 当上次登录时间大于电脑时间，证明电脑时间被篡改为更小的时间，取上次登录时间
        userDay = dateFromFile;
      }
    };
    readLoginConfig(callback);
  }, []);

  useEffect(() => {
    document.onkeydown = function(e) {
      if (e.keyCode === 13) {
        handleClickSignIn();
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
        <span
          className="login-right-tip"
          style={{
            display: offLine ? 'none' : '',
            color: showTip ? '#ff3333' : 'transparent',
          }}
        >
          {offLine ? '' : '* 帐号不存在或密码错误，请重新输入'}
        </span>
        <Button
          disabled={memoizedDisable}
          className="login-right-primary-button"
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
