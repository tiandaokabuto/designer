import { message } from 'antd';

import event, {
  PYTHON_OUTPUT,
} from '../../../designerGraphBlock/layout/eventCenter';
import PATH_CONFIG from '@/constants/localFilePath';
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const process = require('process');

export default () => {
  return uuid => {
    event.emit('clear_output');
    message.loading('程序运行中', 0);
    const worker = exec(
      PATH_CONFIG('pythonExecute') + ` ${uuid}`,
      {
        encoding: 'buffer',
      },
      (err, stdout, stderr) => {
        if (err) {
          const result = iconv.decode(
            iconv.encode(err.stack, 'cp936'),
            'cp936'
          );
          event.emit(PYTHON_OUTPUT, err.stack);
        }
      }
    );
    worker.stdout.on('data', function(data) {
      const log = iconv.decode(data, 'cp936');
      event.emit(PYTHON_OUTPUT, log);
    });
    worker.stderr.on('data', function(err) {
      const log = iconv.decode(err, 'cp936');
      event.emit(PYTHON_OUTPUT, log);
    });
    worker.on('error', error => {
      const log = iconv.decode(error, 'cp936');
      event.emit(PYTHON_OUTPUT, log);
      message.destroy();
    });
    worker.on('exit', () => {
      console.log('结束了');
      message.destroy();
    });
  };
};
