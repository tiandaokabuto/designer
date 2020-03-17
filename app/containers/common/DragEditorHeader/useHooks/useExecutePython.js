import event, {
  PYTHON_OUTPUT,
} from '../../../designerGraphBlock/layout/eventCenter';
const { exec } = require('child_process');
const iconv = require('iconv-lite');

export default () => {
  return () => {
    event.emit('clear_output');
    const worker = exec(`python ${process.cwd()}/python/temp.py`, {
      encoding: 'buffer',
    });
    worker.stdout.on('data', function(data) {
      const log = iconv.decode(data, 'cp936');
      event.emit(PYTHON_OUTPUT, log);
    });
    worker.stderr.on('data', function(err) {
      const log = iconv.decode(err, 'cp936');
      event.emit(PYTHON_OUTPUT, log);
    });
  };
};
