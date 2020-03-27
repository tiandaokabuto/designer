import event, {
  PYTHON_OUTPUT,
} from '../../../designerGraphBlock/layout/eventCenter';
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const process = require('process');

export default () => {
  return () => {
    event.emit('clear_output');
    console.log(`${process.cwd()}/../Python/python3_lib/python.exe`);
    const worker = exec(
      `${process.cwd()}/../Python/python3_lib/python.exe ${process.cwd()}/python/temp.py`,
      {
        encoding: 'buffer',
      }
    );
    // const worker = exec(`python ${process.cwd()}/python/temp.py`, {
    //   encoding: 'buffer',
    // });
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
