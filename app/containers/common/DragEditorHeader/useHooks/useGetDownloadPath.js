import store from '../../../../store';
const { ipcRenderer } = require('electron');
/**
 * 下载流程执行文件到可选的本地文件夹
 */
export default () => {
  return (callback, processName, descText, versionText) => {
    ipcRenderer.send('open-directory-dialog', 'openDirectory');
    ipcRenderer.on('selectedItem', (e, filePath) => {
      const {
        grapheditor: { editorBlockPythonCode },
      } = store.getState();
      callback &&
        callback(
          filePath,
          editorBlockPythonCode,
          processName,
          descText,
          versionText
        );
    });
  };
};
