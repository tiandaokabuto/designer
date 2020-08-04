import React, { useEffect, useRef, memo } from 'react';
import CodeMirror from 'codemirror';
import { useSelector } from 'react-redux';

import CodeMirrorEditor from './CodeMirrorEditor';

export default memo(() => {
  const pythonCode = useSelector(state => state.blockcode.pythonCode);
  return <CodeMirrorEditor value={pythonCode} readOnly />;
});
