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
console.log(
  encrypt.argDecryptByDES(
    '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'
  )
);

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
    config.context = `https://${ip}:${port}`;
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
    document.onkeydown = function (e) {
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
