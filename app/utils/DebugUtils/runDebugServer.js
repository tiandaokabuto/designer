import event, { PYTHOH_DEBUG_SERVER_START } from '../../containers/eventCenter';
import { getUTF8 } from './getUTF8';
const net = require('net');
const path = require('path');
const process = require('process');
const { spawn } = require('child_process');

const port = 3001;
const hostname = '127.0.0.1';
let socket;
let worker;

export const runDebugServer = async () => {
  // 打开python Debug服务器
  worker = await spawn(`${process.cwd()}/../Python/python3_lib/python.exe`, [
    `${process.cwd()}/../Python/python3_lib/debug/DebugServer.py`,
  ]);

  console.log(worker);

  socket = new net.Socket();
  socket.connect(port, hostname, function() {
    localStorage.setItem('debug', '运行中');
    event.emit(PYTHOH_DEBUG_SERVER_START, '连接');
  });

  socket.on('error', function(err) {
    console.log(err);
  });

  socket.on('data', msg => {
    console.log('[收到soket—data]',msg);
  });

  // python的情况
  worker.stderr.on('exit', code => {
    localStorage.setItem('debug', '关闭');
    event.emit(PYTHOH_DEBUG_SERVER_START, '退出');
  });

  worker.stderr.on('data', stdout => {
    const log = getUTF8(stdout);

    console.log(`stdout: ${log}`);
  });
};

// export const testRunOneLine = () => {
//   const jsonObj = {
//     method_name: 'RPA_6f0d05fa',
//     source: ['from sendiRPA import WindowsAuto,ImageMatch'],
//     var_data: [
//       {
//         var_name: '',
//         var_value: '',
//       },
//     ],
//   };
//   console.log(JSON.stringify(jsonObj));
//   socket.write(JSON.stringify(jsonObj));
// };

export const sendPythonCodeByLine = sendMsg => {
  const { varNames, output } = sendMsg;
  const jsonObj = {
    method_name: "RPA_test",
    //source: ["import GUI\nresult = GUI.showDialog(title = \"\", msg = \"\", dialogType = \"showinfo\")\n\n\npass\n"],
    source:[output],
    var_data: [
      {
        var_name: varNames,
        var_value: "",
      },
    ],
  };
  const sendText = JSON.stringify(jsonObj)//.replace(/'/g, '"')
  console.log(`【实际发送到socket的字符串】\n`,sendText);
  socket.write(sendText);
  //socket.write('{"method_name":"RPA_test","source":["from sendiRPA import Browser\n\n\nhWeb = Browser.openBrowser(browserType = \"chrome\", _url = \"www.baidu.com\", useragent = \"\", blocked_urls = \"\")\n\npass\n"],"var_data":[{"var_name":"hWeb","var_value":""}]}');
};

export const killTask = () => {
  try {
    socket.write('exit()')
    setTimeout(()=>worker.kill(),3000)
    localStorage.setItem('debug', '关闭');
    event.emit(PYTHOH_DEBUG_SERVER_START, '终止');
    setTimeout(()=> event.emit(PYTHOH_DEBUG_SERVER_START, '准备'),3000)
  } catch (e) {
    console.log('终止debug', e);
  }

};
