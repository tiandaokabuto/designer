import event, {
  PYTHOH_DEBUG_SERVER_START,
  PYTHON_OUTPUT,
  PYTHON_GO_NEXT_STEP,
  PYTHOH_DEBUG_BLOCK_ALL_RUN,
  PYTHOH_DEBUG_CARDS_ALL_RUN,
} from '../../containers/eventCenter';
import { message } from 'antd';

// *新DEBUG
import {
  // DEBUG_RUN_BLOCK_CHANGE_STATE_END,
  // DEBUG_RUN_CARDS_CHANGE_STATE_END,
  DEBUG_RUN_CARDS_CHANGE_STATE_END,
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_BLOCK_ALL_RUN,
  DEBUG_RUN_CARDS_ALL_RUN,
  DEBUG_ONE_STEP_FINISHED,
  DEBUG_PUT_SOURCECODE,
  //
  DEBUG_SOURCECODE_INSERT,
} from '../../constants/actions/debugInfos';

import store from '@/store';

import {
  getDebugIndex,
  set_spResult,
  get_spResult,
} from '../../containers/designerGraphEdit/RPAcore';

import { changeDebugInfos } from '../../containers/reduxActions';

import { getUTF8 } from './getUTF8';
import { words } from 'lodash';
const net = require('net');
const path = require('path');
const process = require('process');
const { spawn, exec } = require('child_process');
const fs = require('fs');

const port = 3001;
const hostname = '127.0.0.1';
let socket;
let worker;
let tempLength = 0;

export const runDebugServer = async () => {
  try {
    worker.kill();
  } catch (e) {
    console.log('没得杀了');
  }

  // 打开python Debug服务器
  worker = await spawn(`${process.cwd()}/../Python/python3_lib/python.exe`, [
    `${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/debug/DebugServer.py`,
    // `${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/PYDHandle.py`,
    // `DebugServer`,
  ]);

  // `${process.cwd()}/../Python/python3_lib/Lib/site-packages/sendiRPA/PYDHandle.py CaptureAreaScreen`,

  // worker = await exec(
  //   `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/../Python/python3_lib/debug/DebugServer.py`,
  //   { encoding: 'gb2312' },
  //   (error, stdout) => {
  //     console.log('stdout1', stdout);
  //   }
  // );

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
    // o -> 标题菜单 -> 启动
    changeDebugInfos(DEBUG_OPEN_DEBUGSERVER, {});
  });

  socket.on('error', function(err) {
    //message.warning('Debug功能遇到通讯错误');
    // try{
    //   worker.close()
    //   socket.close()
    //   changeDebugInfos(DEBUG_CLOSE_DEBUGSERVER, {});
    // }catch(e){

    // }
    //event.emit(DEBUG_CLOSE_DEBUGSERVER);
    console.log(err);
  });

  socket.on('data', msg => {
    console.log(msg);
    const log = getUTF8(msg);

    const {
      debug: { runningState },
    } = store.getState();
    // 当前的运行状态
    const running = runningState;

    try {
      const getLogToJSON = JSON.parse(log);
      console.log('[收到soket—data]', getLogToJSON, getLogToJSON.pk);

      let temp = '';

      let spResult = get_spResult();
      console.log(`spResult`, spResult, getLogToJSON.pk);
      if (getLogToJSON.pk && spResult && spResult.pk) {
        if (
          spResult.pk
            .slice(0, -1)
            .reduce((pre, index) => (pre += index.toString()), '') ===
          getLogToJSON.pk.reduce((pre, index) => (pre += index.toString()), '')
        ) {
          set_spResult(getLogToJSON.is_continue);
        } else {
          console.log('pk不一致');
        }
      }

      // 假如是有错误的消息的话
      if (getLogToJSON) {
        if (getLogToJSON.outputs) {
          if (getLogToJSON.outputs.stderr !== '') {
            // if (running === 'blockAll_running') {
            //   changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
            // } else if (running === 'cardsAll_running') {
            //   changeDebugInfos(DEBUG_RUN_CARDS_CHANGE_STATE_END, {});
            // } else if (
            //   running === 'started_one' ||
            //   running === 'cardsAll_one' ||
            //   running === 'blockAll_one'
            // ) {
            //   event.emit(DEBUG_ONE_STEP_FINISHED); // 单步跑完，通知结束
            // }
            if((getLogToJSON.outputs.stderr).indexOf("Error: 'return' outside function") === -1){
              message.warning(`${getLogToJSON.pk}该语句执行出错`);
            }

          }
        }
      }

      // Object.keys(getLogToJSON).forEach(array => {
      //   console.log(array);
      //   // array.forEach(item =>{
      //   //   if(item.source.length > 0){
      //   //     temp += `发送的代码：\n` + item.source[0
      //   //     ]
      //   //   }
      //   // })
      //   //temp = `发送的代码：\n` + array.sources[0];
      // });
      //event.emit(PYTHON_OUTPUT, log);

      console.log('执行了', getLogToJSON.pk);
      event.emit(DEBUG_SOURCECODE_INSERT, {
        log: getLogToJSON,
        pk: getLogToJSON.pk ? getLogToJSON.pk : [],
        index: getDebugIndex(),
      });
    } catch (e) {
      //console.clear();
      console.log(e);
    }

    // event.emit(PYTHON_GO_NEXT_STEP, 'block');

    //const running = localStorage.getItem('running_mode');

    // if 现在的运行模式是
    if (running === 'blockAll_running') {
      // 继续通知下一步
      event.emit(DEBUG_RUN_BLOCK_ALL_RUN);
    } else if (running === 'cardsAll_running') {
      event.emit(DEBUG_RUN_CARDS_ALL_RUN);
    } else if (
      running === 'started_one' ||
      running === 'cardsAll_one' ||
      running === 'blockAll_one'
    ) {
      event.emit(DEBUG_ONE_STEP_FINISHED); // 单步跑完，通知结束
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
      setTimeout(() => {
        const file = fs.readFileSync(
          `${process.cwd()}/../python/python3_lib/Lib/site-packages/sendiRPA/debug/logfile_fromDesigner.log`,
          {
            encoding: 'binary',
          }
        );

        const output = getUTF8(file).substr(tempLength);
        tempLength = output.length;

        event.emit(PYTHON_OUTPUT, output);
      }, 2000);

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
  console.log(`sendMsg`, sendMsg);

  const {
    debug: { dataStore },
    grapheditor: { checkedGraphBlockId },
  } = store.getState();

  const { running, varNames, output, pk } = sendMsg;

  let find_funcName = null;
  if (!running.funcName) {
    find_funcName = dataStore.find(
      block => block.currentId === checkedGraphBlockId
    );
    if (find_funcName) {
      find_funcName = find_funcName.funcName;
    } else {
      find_funcName = '未知函数体';
    }
  }

  const jsonObj = {
    method_name: running.funcName ? running.funcName : find_funcName,
    //source: ["import GUI\nresult = GUI.showDialog(title = \"\", msg = \"\", dialogType = \"showinfo\")\n\n\npass\n"],
    source: [output],
    var_data: [
      {
        var_name: varNames,
        var_value: '',
      },
    ],
    pk: pk,
  };
  const sendText = JSON.stringify(jsonObj); //.replace(/'/g, '"')
  console.log(`【实际发送到socket的字符串】\n`, sendText);
  socket.write(sendText);
  //socket.write('{"method_name":"RPA_test","source":["from sendiRPA import Browser\n\n\nhWeb = Browser.openBrowser(browserType = \"chrome\", _url = \"www.baidu.com\", useragent = \"\", blocked_urls = \"\")\n\npass\n"],"var_data":[{"var_name":"hWeb","var_value":""}]}');
};

export const sendChangeVariable = sendMsg => {
  console.log(`sendMsg`, sendMsg);

  const { var_data, method_name } = sendMsg;
  const jsonObj = {
    method_name: method_name,
    //source: ["import GUI\nresult = GUI.showDialog(title = \"\", msg = \"\", dialogType = \"showinfo\")\n\n\npass\n"],
    source: [],
    var_data: var_data,
    // : [
    //   {
    //     var_name: varNames,
    //     var_value: '',
    //   },
    // ],
  };
  const sendText = JSON.stringify(jsonObj); //.replace(/'/g, '"')
  console.log(`【实际发送到socket的字符串】\n`, sendText);
  socket.write(sendText);
  //socket.write('{"method_name":"RPA_test","source":["from sendiRPA import Browser\n\n\nhWeb = Browser.openBrowser(browserType = \"chrome\", _url = \"www.baidu.com\", useragent = \"\", blocked_urls = \"\")\n\npass\n"],"var_data":[{"var_name":"hWeb","var_value":""}]}');
};

export const killTask = () => {
  tempLength = 0;
  try {
    changeDebugInfos(DEBUG_CLOSE_DEBUGSERVER, {});
    changeDebugInfos(DEBUG_PUT_SOURCECODE, {});

    console.log(socket);

    // if (!socket.connecting) {
    //   worker.kill();
    //   return;
    // }

    socket.write('exit()');
    setTimeout(() => {
      worker.kill();
    }, 2000);
    //localStorage.setItem('debug', '关闭');
    // event.emit(PYTHOH_DEBUG_SERVER_START, '终止');
    // setTimeout(() => event.emit(PYTHOH_DEBUG_SERVER_START, '准备'), 3000);
  } catch (e) {
    console.log('终止debug', e);
    try {
      worker.kill();
    } catch (e) {
      console.log('强杀debug', e);
    }
  }
};
