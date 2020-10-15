import React, { useCallback } from 'react';
import { Input, Button } from 'antd';
import uniqueId from 'lodash/uniqueId';

const { ipcRenderer } = require('electron');

let listener = null;

export default ({
  keyFlag,
  param,
  handleEmitCodeTransform,
  setFlag,
  fileType,
  filters,
}) => {
  const handleFilePath = useCallback(
    (e, filePath) => {
      if (listener === param && filePath && filePath.length) {
        setFlag(true);
        setTimeout(() => {
          setFlag(false);
        }, 50);
        const str = `r'${filePath[0].replace(/\//g, '\\\\')}'`;
        if (str.charAt(str.length - 2) === '\\') {
          console.log('以\\结尾');
          param.value = str.slice(0, str.length - 2) + "'";
        } else {
          param.value = str;
        }
        // param.value = `r'${filePath[0].replace(/\//g, '\\\\')}'`;
        handleEmitCodeTransform();
      }
    },
    [param]
  );

  return (
    <div className="parampanel-choosePath">
      <Input
        key={keyFlag ? uniqueId('key_') : ''}
        defaultValue={param.value || param.default}
        onChange={e => {
          param.value = e.target.value;
          handleEmitCodeTransform();
        }}
      />
      <Button
        style={{
          marginLeft: 8,
          width: 38,
        }}
        onClick={() => {
          listener = param;
          ipcRenderer.removeAllListeners('chooseItem');
          ipcRenderer.send(
            'choose-directory-dialog',
            'showOpenDialog',
            '选择',
            [fileType],
            filters
          );
          ipcRenderer.on('chooseItem', handleFilePath);
        }}
        icon="ellipsis"
      ></Button>
    </div>
  );
};
