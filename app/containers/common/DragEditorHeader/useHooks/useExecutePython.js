import event, {
  PYTHON_OUTPUT,
} from '../../../designerGraphBlock/layout/eventCenter';
import PATH_CONFIG from '@/constants/localFilePath';
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const process = require('process');

export default () => {
  return () => {
    event.emit('clear_output');

    const worker = exec(
      PATH_CONFIG('pythonExecute'),
      {
        encoding: 'buffer',
      },
      (err, stdout, stderr) => {
        if (err) {
          const result = iconv.decode(
            iconv.encode(err.stack, 'cp936'),
            'cp936'
          );
          console.log(result);
          console.log(err.stack);
          event.emit(PYTHON_OUTPUT, err.stack);
        }
      }
    );
    worker.stdout.on('data', function(data) {
      const log = iconv.decode(data, 'cp936');
      console.log(log);
      event.emit(PYTHON_OUTPUT, log);
    });
    worker.stderr.on('data', function(err) {
      const log = iconv.decode(err, 'cp936');
      console.log(log);
      event.emit(PYTHON_OUTPUT, log);
    });
    worker.on('error', error => {
      console.log(err);
      console.log(typeof err);
      const log = iconv.decode(error, 'cp936');
      console.log(log);
      event.emit(PYTHON_OUTPUT, log);
    });
  };
};
