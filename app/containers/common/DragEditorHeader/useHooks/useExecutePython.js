import { message } from 'antd';

import event, {
  PYTHON_OUTPUT,
} from '../../../designerGraphBlock/layout/eventCenter';
import PATH_CONFIG from '@/constants/localFilePath.js';
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const process = require('process');

const getUTF8 = binary => {
  const bufferReader = Buffer.from(binary, 'binary');
  const logGBK = iconv.decode(bufferReader, 'cp936'); // gbk字符串
  const logBufferUtf8 = iconv.encode(logGBK, 'utf8'); // utf8的buffer
  const logUtf8 = iconv.decode(logBufferUtf8, 'utf8');
  return logUtf8;
};

export default () => {
  return (uuid, callback) => {
    event.emit('clear_output');
    const path = PATH_CONFIG('pythonExecute') + ` ${uuid}`;
    const worker = exec(
      path,
      {
        encoding: 'binary',
      },
      (err, stdout, stderr) => {
        if (err) {
          // const result = iconv.decode(
          //   iconv.encode(err.stack, 'cp936'),
          //   'cp936'
          // );
          const log = getUTF8(err.stack);
          event.emit(PYTHON_OUTPUT, log);
        }
      }
    );
    worker.stdout.on('data', function(data) {
      const log = getUTF8(data);
      event.emit(PYTHON_OUTPUT, log);
    });
    worker.stderr.on('data', function(data) {
      const log = getUTF8(data);
      event.emit(PYTHON_OUTPUT, log);
    });
    worker.on('error', error => {
      const log = getUTF8(error);
      event.emit(PYTHON_OUTPUT, log);
      message.destroy();
      callback && callback();
    });
    worker.on('exit', () => {
      console.log('结束了');
      message.destroy();
      callback && callback();
    });
  };
};
