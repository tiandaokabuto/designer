import event, {
  PYTHOH_DEBUG_SERVER_START,
  PYTHON_OUTPUT,
  PYTHON_GO_NEXT_STEP,
  PYTHOH_DEBUG_BLOCK_ALL_RUN,
  PYTHOH_DEBUG_CARDS_ALL_RUN
} from '../../containers/eventCenter';

import { getUTF8 } from './getUTF8';
const net = require('net');
const path = require('path');
const process = require('process');
const { spawn } = require('child_process');
const fs = require('fs');

const port = 3001;
const hostname = '127.0.0.1';
let socket;
let worker;
let tempLength = 0;

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
    console.log(msg)
    const log = getUTF8(msg);
    console.log('[收到soket—data]', JSON.parse(log));

    event.emit(PYTHON_OUTPUT, log);
    // event.emit(PYTHON_GO_NEXT_STEP, 'block');

    // if 现在的运行模式是 第一层 自动单步
    if(localStorage.getItem("running_mode") === "blockAll_running"){
      event.emit(PYTHOH_DEBUG_BLOCK_ALL_RUN);
    }else if(localStorage.getItem("running_mode") === "cardsAll_running"){
      event.emit(PYTHOH_DEBUG_CARDS_ALL_RUN);
    }


    try {
      // fs.open(
      //   `${process.cwd()}/../python/python3_lib/debug/logfile_fromDesigner.log`,
      //   'r',
      //   function(err, fd) {
      //     if (err) {
      //       console.error(err);
      //       return;
      //     }

      //     let buffer = new Buffer(8000);
      //     let readfile = fs.readSync(fd, buffer);

      //     console.log(`读出`,readfile);
      //   }
      // );
      //const file =  fs.readSync(fd, buffer, offset, length, position)
      setTimeout(()=>{
        const file = fs.readFileSync(
          `${process.cwd()}/../python/python3_lib/debug/logfile_fromDesigner.log`,
          {
            encoding: 'binary',
          }
        );

        const output = getUTF8(file).substr(tempLength);
        tempLength = output.length;

        event.emit(PYTHON_OUTPUT, output);
      },2000)

      // var buf = new Buffer.alloc(1024);

      // fs.open(
      //   `${process.cwd()}/../python/python3_lib/debug/logfile_fromDesigner.log`,
      //   'r',
      //   function(err, fd) {
      //     if (err) throw err;
      //     console.log('打开文件成功！');
      //     fs.read(fd, buf, 0, buf.length, tempLength, (err, bytes)=> {
      //       if (err) throw err;
      //       console.log(bytes + '  字节被读取');
      //       // 仅输出读取的字节
      //       if (bytes > 0) {
      //         console.log('文件内容是：' + getUTF8(buf));// buf.slice(0, bytes).toString());
      //       }
      //       tempLength = bytes;
      //     });


      //   }
      // );
    } catch (e) {
      console.log(e);
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


