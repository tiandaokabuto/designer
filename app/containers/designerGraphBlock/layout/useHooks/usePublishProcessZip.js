import React from 'react';
import { useSelector } from 'react-redux';

import { writeFile } from '../../../../nodejs';

export default () => {
  const pythonCode = useSelector(state => state.blockcode.pythonCode);
  const publishZip = () => {
    console.log(pythonCode, 'kkk');
    writeFile(
      __dirname + '/containers/designerGraphBlock/python/test.py',
      pythonCode
    );
  };
  return publishZip;
};
