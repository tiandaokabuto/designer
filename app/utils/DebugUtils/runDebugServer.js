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
    event.emit(PYTHOH_DEBUG_SERVER_START, '连接');
  });

  socket.on('error', function(err) {
    console.log(err);
  });

  worker.stderr.on('exit', code => {
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
    source: [output],
    var_data: [
      {
        var_name: varNames,
        var_value: "",
      },
    ],
  };
  const sendText = JSON.stringify(jsonObj)//.replace(/'/g, '"')
  console.log(sendText);
  socket.write(sendText);
};

export const killTask = () => {
  try {
    worker.kill();
    event.emit(PYTHOH_DEBUG_SERVER_START, '终止');
  } catch (e) {
    console.log('终止debug', e);
  }
};
