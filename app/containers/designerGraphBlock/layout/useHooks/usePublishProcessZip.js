import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import { writeFile } from '../../../../nodejs';

export default () => {
  //发布整个流程块的代码
  const pythonCode = useSelector(
    state => state.grapheditor.editorBlockPythonCode
  );

  console.log(pythonCode, '+++');

  const publishZip = (descText, versionText) => {
    const process = require('process');
    console.log(pythonCode, '---');
    writeFile(
      `${process.cwd()}/python/test.py`,
      pythonCode,
      descText,
      versionText
    );
  };
  return publishZip;
};
