import useDebounce from 'react-hook-easier/lib/useDebounce';
import { message } from 'antd';

import { readAllFileName } from '../../common/utils';
import { changeCurrentProject } from '../../reduxActions';

import PATH_CONFIG from '@/constants/localFilePath.js';

const fs = require('fs');

export default () => {
  return useDebounce((current, change) => {
    const existFileList = readAllFileName() || [];
    const reg = /[?:<>|*"{}\[\]\/\\]/g;
    if (reg.test(change)) {
      message.error('不能包含特殊字符');
      return;
    }

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
          fs.rename(
            PATH_CONFIG('project', `${change}/${current}_module`),
            PATH_CONFIG('project', `${change}/${change}_module`),
            function(err) {
              if (!err) {
                console.log('更改module文件夹');
              } else {
                console.log(err);
              }
            }
          );
        } else {
          console.log(err);
        }
      }
    );
  }, 333);
};
