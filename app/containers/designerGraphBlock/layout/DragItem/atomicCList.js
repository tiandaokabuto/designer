import React from 'react';
import { Icon } from 'antd';

import { BasicStatementTag } from '../statementTags';

export default [
  {
    title: '鼠标与键盘',
    key: '0-0',
    icon: <Icon type="hdd" />,
    children: [
      {
        title: '打开谷歌浏览器',
        key: '0-0-0',
        item: {
          $$typeof: BasicStatementTag,
          text: '启动chrome浏览器', // 代码的描述文字
          module: 'selenium',
          pkg: 'webdriver',
          cmdName: '启动新的浏览器',
          visible: '启动" chrome"浏览器，并将此浏览器作为控对象，赋值给hWeb',
          main: 'Chrome',
          output: 'hWeb',
          outputDesc: '输出说明：返回是否启动成功',
          cmdDesc: '命令说明、描述',
          properties: {
            required: [
              {
                cnName: '输出到',
                enName: 'outPut',
                value: 'hWeb',
                default: 'hWeb',
              },
              {
                cnName: '浏览器类型',
                enName: 'executable_path',
                value: "'C:\\chromedriver\\chromedriver.exe'",
                default: "'C:\\chromedriver\\chromedriver.exe'",
                desc: '属性说明',
                paramType: '参数类型：0:变量，',
                componentType: '组件类型:1：下拉框',
                valueMapping: [
                  {
                    name: '谷歌chrome浏览器',
                    value: 'chrome',
                  },
                  {
                    name: '火狐浏览器',
                    value: 'fireFox',
                  },
                ],
              },
            ],
            optional: [],
          },
        },
        icon: <Icon type="branches" />,
      },
    ],
  },
  {
    title: '界面元素',
    key: '0-1',
    icon: <Icon type="hdd" />,
    children: [],
  },
];
