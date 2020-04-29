const CryptoJS = require('crypto-js'); //引用AES源码js

const fs = require('fs');

const currPath = process.cwd();

const writeFileRecursive = function(path, buffer, callback) {
  const lastPath = path.substring(0, path.lastIndexOf('/'));
  fs.mkdir(lastPath, { recursive: true }, err => {
    if (err) return callback(err);
    fs.writeFile(path, buffer, function(err) {
      if (err) return callback(err);
      return callback(null);
    });
  });
};

// 加密方法
const encryptKey = '**********'; // 秘钥
const argEncryptByDES = message => {
  const keyHex = CryptoJS.enc.Utf8.parse(encryptKey);
  const ciphertext = CryptoJS.enc.Utf8.parse(message);
  const encrypted = CryptoJS.DES.encrypt(ciphertext, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

// 单个参数des解密
const argDecryptByDES = message => {
  const keyHex = CryptoJS.enc.Utf8.parse(encryptKey);
  const decrypted = CryptoJS.DES.decrypt(message, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// 获取用户电脑时间
export const getUserDay = () => {
  let date = new Date();
  let month = date.getMonth() + 1;
  month = month > 9 ? month : '0'.concat(month);
  let day = date.getDate();
  day = day > 9 ? day : '0'.concat(day);
  const seperator = '-';
  date = date.getFullYear() + seperator + month + seperator + day;
  return date;
};

export const readGlobalConfig = callback => {
  const path = `${currPath}/globalconfig/config.json`;
  fs.readFile(path, function(err, data) {
    if (err) {
      writeFileRecursive(
        path,
        encrypt.argEncryptByDES(
          JSON.stringify({
            ip: '172.168.201.90',
            port: '9999',
          })
        ),
        function(err) {
          if (!err) {
            callback && callback('172.168.201.90', '9999');
          }
        }
      );
    } else {
      const { ip, port, userName, password, serialNumber, userDay, offLine } =
        data.toString().indexOf('{') === -1
          ? JSON.parse(encrypt.argDecryptByDES(data.toString()))
          : JSON.parse(data.toString());
      callback(
        ip,
        port,
        userName,
        password,
        serialNumber,
        offLine,
        // JSON.parse(encrypt.argDecryptByDES(data.toString())).offLine,
        userDay
      );
    }
  });
};

export const writeGlobalConfig = content => {
  const path = `${currPath}/globalconfig/config.json`;
  fs.readFile(path, function(err, data) {
    if (!err) {
      const config = data.toString()
        ? data.toString().indexOf('{') === -1
          ? JSON.parse(encrypt.argDecryptByDES(data.toString()))
          : JSON.parse(data.toString())
        : {};
      fs.writeFile(
        path,
        encrypt.argEncryptByDES(
          JSON.stringify({
            ...config,
            ...content,
          })
        ),
        function() {}
      );
    }
  });
};

export const encrypt = {
  argEncryptByDES,
  argDecryptByDES,
};

export { hex_sha1 } from './hex_sha1';
