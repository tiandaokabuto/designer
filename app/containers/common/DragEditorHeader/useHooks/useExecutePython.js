import event, {
  PYTHON_OUTPUT,
} from '../../../designerGraphBlock/layout/eventCenter';
const { exec } = require('child_process');
//const iconv = require('iconv-lite');

export default () => {
  return () => {
    event.emit('clear_output');
    const worker = exec(`python ${process.cwd()}/python/temp.py`);
    worker.stdout.on('data', function(data) {
      console.log(data);
      event.emit(PYTHON_OUTPUT, data);
    });
    worker.stderr.on('data', function(err) {
      console.log(err);
      event.emit(PYTHON_OUTPUT, err);
    });
  };
};
