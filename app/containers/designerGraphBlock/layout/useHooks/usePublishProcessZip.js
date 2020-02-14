import React from 'react';
import { useSelector } from 'react-redux';

import { writeFile } from '../../../../nodejs';

export default () => {
  const pythonCode = useSelector(state => state.blockcode.pythonCode);
  const publishZip = () => {
    const process = require('process');
    console.log(pythonCode, 'kkk');
    writeFile(
      // __dirname + '/containers/designerGraphBlock/python/test.py',
      `${process.cwd()}/python/test.py`,
      pythonCode
    );
  };
  return publishZip;
};
