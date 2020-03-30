import useDebounce from 'react-hook-easier/lib/useDebounce';
import { message } from 'antd';

import { readAllFileName } from '../../common/utils';
import { changeCurrentProject } from '../../reduxActions';

import PATH_CONFIG from '@/constants/localFilePath';

const fs = require('fs');

export default () => {
  return useDebounce((current, change) => {
    const existFileList = readAllFileName() || [];
    if (existFileList.some(item => item.name === change)) {
      message.info('当前项目名已存在');
      return;
    }

    fs.rename(
      PATH_CONFIG('project', current),
      PATH_CONFIG('project', change),
      function(err) {
        if (!err) {
          changeCurrentProject(change);
        }
      }
    );
  }, 333);
};
