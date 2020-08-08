import event, {
  PYTHOH_DEBUG_SERVER_START,
  PYTHON_OUTPUT,
} from '../../containers/eventCenter';

import { getUTF8 } from './getUTF8';
import { file } from '../../../../../Users/鲸/AppData/Local/Microsoft/TypeScript/3.9/node_modules/@babel/types/lib/index';
const net = require('net');
const path = require('path');
const process = require('process');
const { spawn } = require('child_process');
const fs = require('fs');

const port = 3001;
const hostname = '127.0.0.1';
let socket;
let worker;

export const runDebugServer = async () => {
  // 打开python Debug服务器
  worker = await spawn(`${process.cwd()}/../Python/python3_lib/python.exe`, [
    `${process.cwd()}/../Python/python3_lib/debug/DebugServer.py`,
  ]);

  // python的情况
  worker.stderr.on('exit', code => {
    localStorage.setItem('debug', '关闭');
    event.emit(PYTHOH_DEBUG_SERVER_START, '退出');
  });

  worker.stderr.on('data', stdout => {
    const log = getUTF8(stdout);
    // 输出python日志
    console.log(`stdout: ${log}`);
  });

  socket = new net.Socket();
  socket.connect(port, hostname, function() {
    localStorage.setItem('debug', '运行中');
    event.emit(PYTHOH_DEBUG_SERVER_START, '连接');
  });

  socket.on('error', function(err) {
    console.log(err);
  });

  socket.on('data', msg => {
    const log = getUTF8(msg);
    console.log('[收到soket—data]', log);
    event.emit(PYTHON_OUTPUT, log);

    try {
      const file = fs.readFileSync(
        `${process.cwd()}/../python/python3_lib/debug/logfile_fromDesigner.log`,
        {
          encoding: 'binary',
        }
      );
      event.emit(PYTHON_OUTPUT, getUTF8(file));
    } catch (e) {
      console.log(e)
    }
  });
};

export const runAllStepByStepAuto = (
  cards = [],
  level = 'block' /** editor第一层 block第二层 */
) => {
  // TODO 按照顺序一个一个块发送执行
  // const jsonObj = {
  //   method_name: 'RPA_6f0d05fa',
  //   source: ['from sendiRPA import WindowsAuto,ImageMatch'],
  //   var_data: [
  //     {
  //       var_name: '',
  //       var_value: '',
  //     },
  //   ],
  // };
  // console.log(JSON.stringify(jsonObj));
  // socket.write(JSON.stringify(jsonObj));
};

export const sendPythonCodeByLine = sendMsg => {
  const { varNames, output } = sendMsg;
  const jsonObj = {
    method_name: '',
    //source: ["import GUI\nresult = GUI.showDialog(title = \"\", msg = \"\", dialogType = \"showinfo\")\n\n\npass\n"],
    source: [output],
    var_data: [
      {
        var_name: varNames,
        var_value: '',
      },
    ],
  };
  const sendText = JSON.stringify(jsonObj); //.replace(/'/g, '"')
  console.log(`【实际发送到socket的字符串】\n`, sendText);
  socket.write(sendText);
  //socket.write('{"method_name":"RPA_test","source":["from sendiRPA import Browser\n\n\nhWeb = Browser.openBrowser(browserType = \"chrome\", _url = \"www.baidu.com\", useragent = \"\", blocked_urls = \"\")\n\npass\n"],"var_data":[{"var_name":"hWeb","var_value":""}]}');
};

export const killTask = () => {
  try {
    socket.write('exit()');
    setTimeout(() => worker.kill(), 3000);
    localStorage.setItem('debug', '关闭');
    event.emit(PYTHOH_DEBUG_SERVER_START, '终止');
    setTimeout(() => event.emit(PYTHOH_DEBUG_SERVER_START, '准备'), 3000);
  } catch (e) {
    console.log('终止debug', e);
  }
};
