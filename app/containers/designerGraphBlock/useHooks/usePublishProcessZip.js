import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import { writeFile } from '../../../nodejs';

export default () => {
  //发布整个流程块的代码
  const pythonCode = useSelector(
    state => state.grapheditor.editorBlockPythonCode
  );

  const pythonCodeRef = useRef(null);
  pythonCodeRef.current = pythonCode;

  const publishZip = (descText, versionText, taskDataNames) => {
    const process = require('process');
    writeFile(
      `${process.cwd()}/python/test.py`,
      pythonCodeRef.current,
      descText,
      versionText,
      taskDataNames
    );
  };
  return publishZip;
};
