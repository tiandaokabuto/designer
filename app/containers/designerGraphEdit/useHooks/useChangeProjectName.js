import useDebounce from 'react-hook-easier/lib/useDebounce';
import { message } from 'antd';

import { readAllFileName } from '_utils/utils';
import { changeCurrentProject } from '../../reduxActions';

import PATH_CONFIG from '@/constants/localFilePath.js';

const fs = require('fs');

export default () => {
  return useDebounce((current, change) => {
    const existFileList = readAllFileName() || [];

    const reg = /(^\s+)|(\s+$)|(\.+$)|[?:@&=+,;<>\s*|*"{}\[\]\/\\]/g;
    if (reg.test(change)) {
      message.error('不能包含特殊字符，前后不能包含空格');
      return;
    }
    if (change.length > 100) {
      message.info('输入的内容长度不能大于100');
      return;
    }

    if (existFileList.some(item => item.name === change)) {
      message.info('当前项目名已存在');
      return;
    }

    fs.rename(
      PATH_CONFIG('project', current),
      PATH_CONFIG('project', change),
      function (err) {
        if (!err) {
          changeCurrentProject(change);
          fs.rename(
            PATH_CONFIG('project', `${change}/${current}_module`),
            PATH_CONFIG('project', `${change}/${change}_module`),
            function (err) {
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
