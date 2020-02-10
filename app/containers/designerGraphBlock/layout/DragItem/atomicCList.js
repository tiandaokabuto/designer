/**
 * author: songbb
 * updateDate: 2020/02/04
 * purpose for: 原子能力树型列表
 */
import React from 'react';
import { Icon } from 'antd';

import {
  BasicStatementTag,
  LoopStatementTag,
  ConditionalStatementTag,
} from '../statementTags';

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
  // openBrowser: {
  //   $$typeof: BasicStatementTag,
  //   text: '启动chrome浏览器', // 代码的描述文字
  //   module: 'selenium',
  //   pkg: 'webdriver',
  //   cmdName: '启动新的浏览器',
  //   visible: '启动" chrome"浏览器，并将此浏览器作为控对象，赋值给hWeb',
  //   main: 'Chrome',
  //   output: 'hWeb',
  //   outputDesc: '输出说明：返回是否启动成功',
  //   cmdDesc: '命令说明、描述',
  //   properties: {
  //     required: [
  //       {
  //         cnName: '输出到',
  //         enName: 'outPut',
  //         value: 'hWeb',
  //         default: 'hWeb',
  //         componentType: 0,
  //       },
  //       {
  //         cnName: '浏览器类型',
  //         enName: 'executable_path',
  //         value: "'C:\\chromedriver\\chromedriver.exe'",
  //         default: "'C:\\chromedriver\\chromedriver.exe'",
  //         desc: '属性说明',
  //         paramType: '参数类型：0:变量，',
  //         componentType: 1, //'组件类型:1：下拉框',
  //         valueMapping: [
  //           {
  //             name: '谷歌chrome浏览器',
  //             value: 'chrome',
  //           },
  //           {
  //             name: '火狐浏览器',
  //             value: 'fireFox',
  //           },
  //         ],
  //       },
  //     ],
  //     optional: [],
  //   },
  // },
  openBrowser: {
    $$typeof: BasicStatementTag,
    text: '启动chrome浏览器',
    module: 'sendiRPA',
    pkg: 'browser',
    cmdName: '启动新的浏览器',
    visible: '启动" chrome"浏览器，并将此浏览器作为控对象，赋值给hWeb',
    main: 'openBrowser',
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
          componentType: 0,
        },
      ],
      optional: [
        {
          cnName: '浏览器类型',
          enName: 'executable_path',
          value: "'C:\\chromedriver\\chromedriver.exe'",
          default: "'C:\\chromedriver\\chromedriver.exe'",
          desc: '属性说明',
          paramType: '参数类型：0: 变量，',
          componentType: 1,
          //'组件类型: 1：下拉框',
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
        {
          cnName: '执行前延时',
          enName: 'delayBefore',
          value: 1,
          default: 1,
          desc: '执行动作前延时x秒',
          paramType: 0, //0: 数值,1: 字符串,2为布尔值
          componentType: 0, //组件类型: 0: 输入框,1：下拉框
          valueMapping: [],
        },
        {
          cnName: '执行前延时',
          enName: 'delayAfter',
          value: 1,
          default: 1,
          desc: '执行动作前延时x秒',
          paramType: 0, //0: 数值,1: 字符串,2为布尔值
          componentType: 0, //组件类型: 0: 输入框,1：下拉框
          valueMapping: [],
        },
        {
          cnName: '执行失败是否继续',
          enName: 'continue_On_Failure',
          value: 'True',
          default: 'True',
          desc: '该步骤执行失败之后是否继续执行下一个操作',
          paramType: 2, //0: 数值,1: 字符串,2为布尔值
          componentType: 0,
          //组件类型: 0: 输入框,1：下拉框
          valueMapping: [
            {
              name: '是',
              value: 'True',
            },
            {
              name: '否',
              value: 'False',
            },
          ],
        },
      ],
    },
  },
  /** 鼠标双击截图 */
  doubleClick: {
    $$typeof: BasicStatementTag,
    text: '鼠标双击-截图',
    module: 'clickImage',
    pkg: 'MouseControl',
    cmdName: '鼠标双击-截图',
    visible: '查找图片在屏幕中的位置并双击',
    main: 'scshot_match',
    output: '',
    outputDesc: '没有输出',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          enName: 'ImagePath',
          cnName: '图片路径',
          desc: '图片路径',
          paramType: '参数类型：0:变量，',
          componentType: 0, //'组件类型:0：输入框',
          value: `"C:\\\\Users\\\\Administrator.SC-201902012149\\\\Desktop\\\\template.jpg"`,
          default: `"C:\\\\Users\\\\Administrator.SC-201902012149\\\\Desktop\\\\template.jpg"`,
        },
      ],
      optional: [
        // {
        //   enName: '英文名称',
        //   cnName: '显示的名称',
        //   desc: '属性说明',
        //   paramType: '参数类型：0:变量，1：',
        //   componentType: '组件类型:0：输入框',
        //   default: '默认值',
        // },
      ],
    },
  },
  /** 循环控制命令 */
  loopStatement: {
    $$typeof: LoopStatementTag,
    text: '循环控制语句',
  },
  /** 条件分支命令 */
  conditionalStatement: {
    $$typeof: ConditionalStatementTag,
    text: '条件分支语句',
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
      {
        // title: '鼠标双击截图',
        description: 'doubleClick',
        key: '0-0-1',
        item: abilityToDatastructure['doubleClick'],
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
    children: [
      {
        description: 'loopStatement',
        key: '0-2-0',
        item: abilityToDatastructure['loopStatement'],
        icon: generateIcon('branches'),
      },
      {
        description: 'conditionalStatement',
        key: '0-2-1',
        item: abilityToDatastructure['conditionalStatement'],
        icon: generateIcon('branches'),
      },
    ],
  },
];
