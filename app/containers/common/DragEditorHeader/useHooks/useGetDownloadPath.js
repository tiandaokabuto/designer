import store from '../../../../store';
const { ipcRenderer } = require('electron');
/**
 * 下载流程执行文件到可选的本地文件夹
 */
export default () => {
  return callback => {
    console.log('选择文件夹');
    ipcRenderer.send('open-directory-dialog', 'openDirectory');
    ipcRenderer.on('selectedItem', (e, filePath) => {
      const {
        grapheditor: { editorBlockPythonCode },
      } = store.getState();
      console.log(filePath, editorBlockPythonCode);
      //TODO...
    });
  };
};
