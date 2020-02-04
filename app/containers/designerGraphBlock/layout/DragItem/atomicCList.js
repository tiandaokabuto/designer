/**
 * author: songbb
 * updateDate: 2020/02/04
 * purpose for: 原子能力树型列表
 */
import React from 'react';
import { Icon } from 'antd';

import { BasicStatementTag } from '../statementTags';

const DEFAULT_STYLE = {
  fontSize: '16px',
};

const generateIcon = (type, style = DEFAULT_STYLE) => (
  <Icon type={type} style={style} />
);

/**
 * 原子能力到具体数据结构的映射关系如下
 */
const abilityToDatastructure = {
  /** 启动chrome浏览器 */
  openBrowser: {
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
};

export default [
  {
    title: '鼠标与键盘',
    key: '0-0',
    icon: generateIcon('hdd'),
    children: [
      {
        // title: '打开谷歌浏览器',
        description: 'openBrowser',
        key: '0-0-0',
        item: abilityToDatastructure['openBrowser'],
        icon: generateIcon('branches'),
      },
    ],
  },
  {
    title: '界面元素',
    key: '0-1',
    icon: generateIcon('hdd'),
    children: [],
  },
  {
    title: '基本命令',
    key: '0-2',
    icon: generateIcon('hdd'),
    children: [],
  },
];
