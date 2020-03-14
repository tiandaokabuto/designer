import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import { writeFile } from '../../../../nodejs';

export default () => {
  // FIXME...  改为发布整个流程块的代码
  const pythonCode = useSelector(
    state => state.grapheditor.editorBlockPythonCode
  );

  const pythonCodeRef = useRef(null);
  pythonCodeRef.current = pythonCode;
  // console.log(pythonCodeRef.current, 'sahjdfgksadgfkasdg');
  const publishZip = descText => {
    const process = require('process');
    writeFile(
      `${process.cwd()}/python/test.py`,
      pythonCodeRef.current,
      descText
    );
  };
  return publishZip;
};
