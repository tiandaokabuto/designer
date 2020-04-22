import store from '../../../../store';
const { ipcRenderer } = require('electron');
/**
 * 下载流程执行文件到可选的本地文件夹
 */

export default () => {
  return (callback, processName, descText, versionText) => {
    ipcRenderer.send('open-directory-dialog', 'showSaveDialog', '存储');
    const handleFilePath = (e, filePath) => {
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
    };
    ipcRenderer.removeAllListeners('selectedItem');
    ipcRenderer.on('selectedItem', handleFilePath);
  };
};
