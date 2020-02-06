import { issueProcess } from './utils';
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
let JSZIP = require('jszip');
let zip = new JSZIP();

const writeFileRecursive = function(path, buffer, callback) {
  let lastPath = path.substring(0, path.lastIndexOf('/'));
  fs.mkdir(lastPath, { recursive: true }, err => {
    if (err) return callback(err);
    fs.writeFile(path, buffer, function(err) {
      if (err) return callback(err);
      return callback(null);
    });
  });
};

function readDir(obj, nowPath) {
  let files = fs.readdirSync(nowPath); //读取目录中的所有文件及文件夹（同步操作）
  files.forEach(function(fileName, index) {
    //遍历检测目录中的文件
    // console.log(fileName, index); //打印当前读取的文件名
    let fillPath = nowPath + '/' + fileName;
    let file = fs.statSync(fillPath); //获取一个文件的属性
    if (file.isDirectory()) {
      //如果是目录的话，继续查询
      let dirlist = zip.folder(fileName); //压缩对象中生成该目录
      readDir(dirlist, fillPath); //重新检索目录文件
    } else {
      obj.file(fileName, fs.readFileSync(fillPath)); //压缩目录添加文件
    }
  });
}

export const startZIP = () => {
  var currPath = __dirname; //文件的绝对路径 当前当前js所在的绝对路径
  var targetDir = path.join(currPath, '/containers/designerGraphBlock/python');
  readDir(zip, targetDir);
  zip
    .generateAsync({
      //设置压缩格式，开始打包
      type: 'nodebuffer', //nodejs用
      compression: 'DEFLATE', //压缩算法
      compressionOptions: {
        //压缩级别
        level: 9,
      },
    })
    .then(function(content) {
      fs.writeFileSync(currPath + '/nodejs/result.zip', content, 'utf-8'); //将打包的内容写入 当前目录下的 result.zip中
      console.log('压缩完成...');
      console.log('开始上传流程包...');
      issueProcess(content);
    });
};

export const writeFile = (dirname, content) => {
  writeFileRecursive(dirname, content, err => {
    if (!err) {
      console.log('开始压缩...');
      startZIP();
    }
  });
};

export const executePython = code => {
  writeFileRecursive(__dirname + '/nodejs/code.py', code, err => {
    let command = `python ${__dirname}/nodejs/code.py`;
    exec(command, (err, stdout, stdin) => {
      if (err) {
        let reg = /[\d\D]*(line\s\d)[\d\D]*?(\w*(?:Error|Exception).*)/im;
        let matchArr = reg.exec(err.message);
        matchArr.shift();
        // res.send(matchArr.join(', '));
      } else {
        console.log(stdout);
      }
    });
  });
};
