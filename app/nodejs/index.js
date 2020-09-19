import { message } from 'antd';
import { issueProcess } from './utils';
import event, {
  PYTHON_OUTPUT,
  PYTHON_OUTPUT_CLEAR,
} from '@/containers/eventCenter';

const fs = require('fs');
const process = require('process');
const { exec } = require('child_process');
const path = require('path');
const JSZIP = require('jszip');

const zip = new JSZIP();

export const writeFileRecursive = function (path, buffer, callback) {
  const lastPath = path.substring(0, path.lastIndexOf('/'));
  fs.mkdir(lastPath, { recursive: true }, err => {
    if (err) return callback(err);
    fs.writeFile(path, buffer, { flag: 'w' }, function (err) {
      if (err) return callback(err);
      return callback(null);
    });
  });
};

export function readDir(obj, nowPath) {
  const files = fs.readdirSync(nowPath); // 读取目录中的所有文件及文件夹（同步操作）
  files.forEach(function (fileName, index) {
    // 遍历检测目录中的文件

    const fillPath = `${nowPath}/${fileName}`;
    const file = fs.statSync(fillPath); // 获取一个文件的属性
    if (file.isDirectory()) {
      // 如果是目录的话，继续查询
      const dirlist = zip.folder(fileName); // 压缩对象中生成该目录
      readDir(dirlist, fillPath); // 重新检索目录文件
    } else {
      obj.file(fileName, fs.readFileSync(fillPath)); // 压缩目录添加文件
    }
  });
}

export const startZIP = (
  descText,
  versionText,
  taskDataNamesData,
  variableNamesData
) => {
  const currPath = process.cwd();
  const targetDir = path.join(currPath, '/python');
  readDir(zip, targetDir);
  zip
    .generateAsync({
      // 设置压缩格式，开始打包
      type: 'nodebuffer', // nodejs用
      compression: 'DEFLATE', // 压缩算法
      compressionOptions: {
        // 压缩级别
        level: 9,
      },
    })
    .then(function (content) {
      issueProcess(
        content,
        descText,
        versionText,
        taskDataNamesData,
        variableNamesData
      ).then(value => {
        console.log(value);
      });
    });
};

export const writeFile = (
  dirname,
  content,
  descText,
  versionText,
  taskDataNamesData,
  variableNamesData
) => {
  writeFileRecursive(dirname, content, err => {
    if (!err) {
      console.log('开始压缩...');
      startZIP(descText, versionText, taskDataNamesData, variableNamesData);
    } else {
      message.info('压缩失败...');
    }
  });
};

export const executePython = code => {
  writeFileRecursive(`${process.cwd()}/python/code.py`, code, err => {
    const command = `python ${process.cwd()}/python/code.py`;
    exec(command, (err, stdout, stdin) => {
      if (err) {
        const reg = /[\d\D]*(line\s\d)[\d\D]*?(\w*(?:Error|Exception).*)/im;
        const matchArr = reg.exec(err.message);
        matchArr.shift();
        // res.send(matchArr.join(', '));
      } else {
        // 将结果回显到输出面板
        console.log(PYTHON_OUTPUT_CLEAR, stdout);
        event.emit(PYTHON_OUTPUT, stdout);
      }
    });
  });
};
