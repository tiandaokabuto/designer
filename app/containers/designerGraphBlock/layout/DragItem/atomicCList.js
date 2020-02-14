/**
 * author: songbb
 * updateDate: 2020/02/04
 * purpose for: 原子能力树型列表
 */
import React from 'react';
import { Icon } from 'antd';

import {
  PrintStatementTag,
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

const generateFrom = (() => {
  const COMMON_DATASTRUCTURE = {
    delayBefore: {
      cnName: '执行前延时',
      enName: 'delayBefore',
      value: undefined,
      default: 1,
      desc: '执行动作前延时x秒',
      paramType: 0, //0: 数值,1: 字符串,2为布尔值
      componentType: 0, //组件类型: 0: 输入框,1：下拉框
      valueMapping: [],
    },
    delayAfter: {
      cnName: '执行前延时',
      enName: 'delayAfter',
      value: undefined,
      default: 1,
      desc: '执行动作前延时x秒',
      paramType: 0, //0: 数值,1: 字符串,2为布尔值
      componentType: 0, //组件类型: 0: 输入框,1：下拉框
      valueMapping: [],
    },
    continue_On_Failure: {
      cnName: '执行失败是否继续',
      enName: 'continue_On_Failure',
      value: undefined,
      default: 'True',
      desc: '该步骤执行失败之后是否继续执行下一个操作',
      paramType: 2, //0: 数值,1: 字符串,2为布尔值
      componentType: 1,
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
    timeout: {
      cnName: '元素检测超时时间',
      enName: '_timeout',
      value: undefined,
      default: 10,
      desc: '检测多少秒没有发现元素则停止',
      paramType: 0,
      componentType: 0,
      valueMapping: [],
    },
  };
  return pick => pick.map(item => COMMON_DATASTRUCTURE[item]);
})();

/**
 * 原子能力到具体数据结构的映射关系如下
 */
const abilityToDatastructure = {
  /** 启动chrome浏览器 */
  openBrowser: {
    $$typeof: BasicStatementTag,
    text: '启动新的浏览器',
    module: 'sendiRPA',
    pkg: 'Browser',
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
          enName: 'driverPath',
          value: '"C:\\\\chromedriver\\\\chromedriver.exe"',
          default: '"C:\\\\chromedriver\\\\chromedriver.exe"',
          desc: '属性说明',
          paramType: '参数类型：0: 变量，',
          componentType: 1,
          //'组件类型: 1：下拉框',
          valueMapping: [
            {
              name: '谷歌chrome浏览器',
              value: '"C:\\\\chromedriver\\\\chromedriver.exe"',
            },
            {
              name: '火狐浏览器',
              value: 'fireFox',
            },
          ],
        },
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
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
  /** 浏览器url跳转 */
  browserUrlJump: {
    $$typeof: BasicStatementTag,
    text: '跳转到URL',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '跳转到URL',
    visible: '跳转到URL',
    main: 'navigateURL',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      _return: { name: 'suc' },
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: '',
          default: 'suc',
          componentType: 0,
        },
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '网页地址',
          enName: '_url',
          value: "'about:blank'",
          default: "'about:blank'",
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 点击元素 */
  clickElement: {
    $$typeof: BasicStatementTag,
    text: '点击元素',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '点击元素',
    visible: '点击元素',
    main: 'click',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 勾选元素 */
  checkElement: {
    $$typeof: BasicStatementTag,
    text: '勾选元素',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '勾选元素',
    visible: '勾选元素',
    main: 'check',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 关闭浏览器 */
  closeBrowser: {
    $$typeof: BasicStatementTag,
    text: '关闭浏览器',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '关闭浏览器',
    visible: '关闭浏览器',
    main: 'closeBrowser',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 获取元素属性 */
  achieveElementProperties: {
    $$typeof: BasicStatementTag,
    text: '获取元素属性',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '获取元素属性',
    visible: '获取元素属性',
    main: 'getElementAttribute',
    output: '_attribute',
    outputDesc: '返回元素属性内容',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: '_attribute',
          default: '_attribute',
          componentType: 0,
        },
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
        {
          cnName: '元素属性名称',
          enName: '_attributeName',
          value: '',
          default: '',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 获取元素文本 */
  achieveElementText: {
    $$typeof: BasicStatementTag,
    text: '获取元素文本',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '获取元素文本',
    visible: '获取元素文本',
    main: 'getElementText',
    output: '_text',
    outputDesc: '返回元素文本内容',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: '_text',
          default: '_text',
          componentType: 0,
        },
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 浏览器窗口最大化 */
  maximizeBrowserWindow: {
    $$typeof: BasicStatementTag,
    text: '浏览器窗口最大化',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '浏览器窗口最大化',
    visible: '浏览器窗口最大化',
    main: 'maximizeBrowser',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 浏览器截屏 */
  screenOfBrowser: {
    $$typeof: BasicStatementTag,
    text: '浏览器截屏',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '浏览器截屏',
    visible: '浏览器截屏',
    main: 'takeScreenshot',
    output: 'img_base64',
    outputDesc: '返回图片base64字符串',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: 'img_base64',
          default: 'img_base64',
          componentType: 0,
        },
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 取消勾选元素 */
  cancelCheckElement: {
    $$typeof: BasicStatementTag,
    text: '取消勾选元素',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '取消勾选元素',
    visible: '取消勾选元素',
    main: 'uncheck',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 上传文本 */
  uploadText: {
    $$typeof: BasicStatementTag,
    text: '上传文件',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '上传文件',
    visible: '上传文件',
    main: 'uploadFile',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
        {
          cnName: '文件位置',
          enName: '_filePath',
          value: '',
          default: '',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 输入文本 */
  inputText: {
    $$typeof: BasicStatementTag,
    text: '输入文本',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '输入文本',
    visible: '输入文本',
    main: 'setText',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
        {
          cnName: '文本内容',
          enName: '_text',
          value: '',
          default: '',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 刷新页面 */
  refreshPage: {
    $$typeof: BasicStatementTag,
    text: '刷新页面',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '刷新页面',
    visible: '刷新页面',
    main: 'refresh',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 双击元素 */
  dbClickElement: {
    $$typeof: BasicStatementTag,
    text: '双击元素',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '双击元素',
    visible: '双击元素',
    main: 'click',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 提示框点取消 */
  promptBoxPointCancel: {
    $$typeof: BasicStatementTag,
    text: '提示框点取消',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '提示框点取消',
    visible: '提示框点取消',
    main: 'dismissAlert',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 提示框点确定 */
  promptBoxPointOk: {
    $$typeof: BasicStatementTag,
    text: '提示框点确定',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '提示框点确定',
    visible: '提示框点确定',
    main: 'acceptAlert',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 下拉框选择 */
  dropDownBoxSelection: {
    $$typeof: BasicStatementTag,
    text: '下拉框选择',
    module: 'sendiRPA',
    pkg: 'Browser',
    cmdName: '下拉框选择',
    visible: '下拉框选择',
    main: 'selectOptionByLabel',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '浏览器对象',
          enName: '_browser',
          value: 'hWeb',
          default: 'hWeb',
          componentType: 0,
        },
        {
          cnName: '元素位置XPath',
          enName: 'xpath',
          value: '""',
          default: undefined,
          componentType: 0,
        },
        {
          cnName: '下拉选项名称',
          enName: '_optionLabel',
          value: '',
          default: '',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom([
          'timeout',
          'delayBefore',
          'delayAfter',
          'continue_On_Failure',
        ]),
      ],
    },
  },
  /** 打开Excel工作簿 */
  openExcel: {
    $$typeof: BasicStatementTag,
    text: '打开Excel工作簿',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '打开Excel工作簿',
    visible: '打开Excel工作簿',
    main: 'openExcel',
    output: '(wb, app)',
    outputDesc: '(工作簿对象, Excel实例)',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: 'wb, app',
          default: 'wb, app',
          componentType: 0,
        },
        {
          cnName: '文件路径',
          enName: 'filePath',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '是否可见',
          enName: 'visible',
          value: 'True',
          default: 'True',
          paramType: 2,
          componentType: 1,
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
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 另存Excel工作簿 */
  saveToExcel: {
    $$typeof: BasicStatementTag,
    text: '另存Excel工作簿',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '另存Excel工作簿',
    visible: '另存Excel工作簿',
    main: 'saveToExcel',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作簿对象',
          enName: 'wb',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
        {
          cnName: '文件路径',
          enName: 'filePath',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 获取行数 */
  getSheetRowSize: {
    $$typeof: BasicStatementTag,
    text: '获取行数',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '获取行数',
    visible: '获取行数',
    main: 'getSheetRowSize',
    output: 'size',
    outputDesc: '工作表行数',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: 'size',
          default: 'size',
          componentType: 0,
        },
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 读取行 */
  readRowValue: {
    $$typeof: BasicStatementTag,
    text: '读取行',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '读取行',
    visible: '读取行',
    main: 'readRowValue',
    output: 'values',
    outputDesc: '行数据数组',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: 'values',
          default: 'values',
          componentType: 0,
        },
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
        {
          cnName: '单元格名称',
          enName: 'name',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 写入行 */
  writeRowValue: {
    $$typeof: BasicStatementTag,
    text: '写入行',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '写入行',
    visible: '写入行',
    main: 'writeRowValue',
    output: '',
    outputDesc: '',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
        {
          cnName: '单元格名称',
          enName: 'name',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
        {
          cnName: '数据值数组',
          enName: 'values',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
        {
          cnName: '是否立即保存',
          enName: 'isSave',
          value: 'False',
          default: 'False',
          paramType: 2,
          componentType: 1,
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
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 保存工作簿 */
  saveExcel: {
    $$typeof: BasicStatementTag,
    text: '保存Excel工作簿',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '保存Excel工作簿',
    visible: '保存Excel工作簿',
    main: 'saveExcel',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作簿对象',
          enName: 'wb',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
          valueMapping: [],
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 关闭工作簿 */
  closeExcel: {
    $$typeof: BasicStatementTag,
    text: '关闭Excel工作簿',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '关闭Excel工作簿',
    visible: '关闭Excel工作簿',
    main: 'closeExcel',
    output: 'suc',
    outputDesc: '成功返回True,失败返回False',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作簿对象',
          enName: 'wb',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: 'Excel实例',
          enName: 'app',
          value: '""',
          default: undefined,
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '是否立即保存',
          enName: 'isSave',
          value: 'False',
          default: 'False',
          paramType: 2,
          componentType: 1,
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
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 新建Excel工作簿  */
  newExcel: {
    $$typeof: BasicStatementTag,
    text: '新建Excel工作簿',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '新建Excel工作簿',
    visible: '新建Excel工作簿',
    main: 'newExcel',
    output: 'wb',
    outputDesc: '工作簿对象',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: 'new_wb',
          default: 'new_wb',
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 打开工作表 */
  openSheet: {
    $$typeof: BasicStatementTag,
    text: '打开工作表',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '打开工作表',
    visible: '打开工作表',
    main: 'openSheet',
    output: 'sheet',
    outputDesc: '工作表对象',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '输出到',
          enName: 'outPut',
          value: 'sht',
          default: 'sht',
          componentType: 0,
        },
        {
          cnName: '工作簿对象',
          enName: 'wb',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '工作表名称',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 读取单元格 */
  readCellValue: {
    $$typeof: BasicStatementTag,
    text: '读取单元格',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '读取单元格',
    visible: '读取单元格',
    main: 'readCellValue',
    output: '(value, value_type)',
    outputDesc: '(单元格数据, 单元格数据类型)',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '单元格名称',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 读取列 */
  readColumnValue: {
    $$typeof: BasicStatementTag,
    text: '读取列',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '读取列',
    visible: '读取列',
    main: 'readColumnValue',
    output: 'values',
    outputDesc: '列数据数组',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '单元格名称',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 获取列数 */
  getSheetColumnSize: {
    $$typeof: BasicStatementTag,
    text: '获取列数',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '获取列数',
    visible: '获取列数',
    main: 'getSheetColumnSize',
    output: 'size',
    outputDesc: '工作表列数',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
      ],
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 删除列 */
  deleteColumn: {
    $$typeof: BasicStatementTag,
    text: '删除列',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '删除列',
    visible: '删除列',
    main: 'deleteColumn',
    output: '',
    outputDesc: '',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '单元格名称或列号',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '是否立即保存',
          enName: 'isSave',
          value: '',
          default: 'False',
          paramType: 2,
          componentType: 1,
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
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 删除行 */
  deleteRow: {
    $$typeof: BasicStatementTag,
    text: '删除行',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '删除行',
    visible: '删除行',
    main: 'deleteRow',
    output: '',
    outputDesc: '',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '单元格名称或行号',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '是否立即保存',
          enName: 'isSave',
          value: '',
          default: 'False',
          paramType: 2,
          componentType: 1,
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
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 写入单元格 */
  writeCellValue: {
    $$typeof: BasicStatementTag,
    text: '写入单元格',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '写入单元格',
    visible: '写入单元格',
    main: 'writeCellValue',
    output: '',
    outputDesc: '',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '单元格名称',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '数据值',
          enName: 'value',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '是否立即保存',
          enName: 'isSave',
          value: '',
          default: 'False',
          paramType: 2,
          componentType: 1,
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
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 写入列 */
  writeColumnValue: {
    $$typeof: BasicStatementTag,
    text: '写入列',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '写入列',
    visible: '写入列',
    main: 'writeColumnValue',
    output: '',
    outputDesc: '',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作表对象',
          enName: 'sht',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '单元格名称',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '数据值数组',
          enName: 'values',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '是否立即保存',
          enName: 'isSave',
          value: '',
          default: 'False',
          paramType: 2,
          componentType: 1,
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
      optional: [
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 新建工作表 */
  newSheet: {
    $$typeof: BasicStatementTag,
    text: '新建工作表',
    module: 'sendiRPA',
    pkg: 'Excel',
    cmdName: '新建工作表',
    visible: '新建工作表',
    main: 'newSheet',
    output: 'sheetName',
    outputDesc: '新创建的工作表名称',
    cmdDesc: '命令说明、描述',
    properties: {
      required: [
        {
          cnName: '工作簿对象',
          enName: 'wb',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '工作表名称',
          enName: 'name',
          value: '',
          default: '',
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '是否立即保存',
          enName: 'isSave',
          value: '',
          default: 'False',
          paramType: 2,
          componentType: 1,
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
      optional: [
        {
          cnName: '在工作表之前',
          enName: 'before',
          value: '',
          default: null,
          paramType: 1,
          componentType: 0,
        },
        {
          cnName: '在工作表之后',
          enName: 'after',
          value: '',
          default: 'null',
          paramType: 1,
          componentType: 0,
        },
        ...generateFrom(['delayBefore', 'delayAfter', 'continue_On_Failure']),
      ],
    },
  },
  /** 控制台输出命令 */
  print: {
    $$typeof: BasicStatementTag,
    subtype: PrintStatementTag,
    text: '控制台打印语句',
    visible: '',
    properties: {
      required: [
        {
          cnName: '模版字符串',
          enName: 'template_string',
          default: '',
          value: '',
          componentType: 0,
        },
      ],
      optional: [
        {
          cnName: '替换类型',
          enName: 'replaceType',
          value: 'format',
          default: 'format',
          desc: '选择打印输出的替换类型',
          paramType: 0, //0: 数值,1: 字符串,2为布尔值
          componentType: 1, //组件类型: 0: 输入框,1：下拉框
          valueMapping: [
            {
              name: 'format',
              value: 'format',
            },
            {
              name: 'format_map',
              value: 'format_map',
            },
          ],
        },
        {
          cnName: '传参',
          enName: 'params',
          value: '',
          default: '',
          desc: 'format函数的入参',
          paramType: 0, //0: 数值,1: 字符串,2为布尔值
          componentType: 0, //组件类型: 0: 输入框,1：下拉框
          valueMapping: [],
        },
      ],
    },
  },
  /** 循环控制命令 */
  loopStatement: {
    $$typeof: LoopStatementTag,
    text: '循环控制语句',
    properties: {
      required: [
        {
          cnName: '循环类型',
          enName: 'looptype',
          default: 'for',
          value: 'for',
          componentType: 1,
          valueMapping: [
            {
              name: 'for 循环',
              value: 'for',
            },
            {
              name: 'while 循环',
              value: 'while',
            },
          ],
        },
        {
          cnName: '循环条件',
          enName: 'loopcondition',
          default: '',
          value: '',
          componentType: 0,
        },
      ],
    },
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
      {
        description: 'browserUrlJump',
        key: '0-0-2',
        item: abilityToDatastructure['browserUrlJump'],
        icon: generateIcon('branches'),
      },
      {
        description: 'clickElement',
        key: '0-0-3',
        item: abilityToDatastructure['clickElement'],
        icon: generateIcon('branches'),
      },
      {
        description: 'checkElement',
        key: '0-0-4',
        item: abilityToDatastructure['checkElement'],
        icon: generateIcon('branches'),
      },
      {
        description: 'closeBrowser',
        key: '0-0-5',
        item: abilityToDatastructure['closeBrowser'],
        icon: generateIcon('branches'),
      },
      {
        description: 'achieveElementProperties',
        key: '0-0-6',
        item: abilityToDatastructure['achieveElementProperties'],
        icon: generateIcon('branches'),
      },
      {
        description: 'achieveElementText',
        key: '0-0-7',
        item: abilityToDatastructure['achieveElementText'],
        icon: generateIcon('branches'),
      },
      {
        description: 'maximizeBrowserWindow',
        key: '0-0-8',
        item: abilityToDatastructure['maximizeBrowserWindow'],
        icon: generateIcon('branches'),
      },
      {
        description: 'screenOfBrowser',
        key: '0-0-9',
        item: abilityToDatastructure['screenOfBrowser'],
        icon: generateIcon('branches'),
      },
      {
        description: 'cancelCheckElement',
        key: '0-0-10',
        item: abilityToDatastructure['cancelCheckElement'],
        icon: generateIcon('branches'),
      },
      {
        description: 'uploadText',
        key: '0-0-11',
        item: abilityToDatastructure['uploadText'],
        icon: generateIcon('branches'),
      },
      {
        description: 'inputText',
        key: '0-0-12',
        item: abilityToDatastructure['inputText'],
        icon: generateIcon('branches'),
      },
      {
        description: 'refreshPage',
        key: '0-0-13',
        item: abilityToDatastructure['refreshPage'],
        icon: generateIcon('branches'),
      },
      {
        description: 'dbClickElement',
        key: '0-0-14',
        item: abilityToDatastructure['dbClickElement'],
        icon: generateIcon('branches'),
      },
      {
        description: 'promptBoxPointCancel',
        key: '0-0-15',
        item: abilityToDatastructure['promptBoxPointCancel'],
        icon: generateIcon('branches'),
      },
      {
        description: 'promptBoxPointOk',
        key: '0-0-16',
        item: abilityToDatastructure['promptBoxPointOk'],
        icon: generateIcon('branches'),
      },
      {
        description: 'dropDownBoxSelection',
        key: '0-0-17',
        item: abilityToDatastructure['dropDownBoxSelection'],
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
    title: 'Excel相关',
    key: '0-3',
    icon: generateIcon('hdd'),
    children: [
      {
        description: 'openExcel',
        key: '0-3-0',
        item: abilityToDatastructure['openExcel'],
        icon: generateIcon('branches'),
      },
      {
        description: 'saveToExcel',
        key: '0-3-1',
        item: abilityToDatastructure['saveToExcel'],
        icon: generateIcon('branches'),
      },
      {
        description: 'getSheetRowSize',
        key: '0-3-2',
        item: abilityToDatastructure['getSheetRowSize'],
        icon: generateIcon('branches'),
      },
      {
        description: 'readRowValue',
        key: '0-3-3',
        item: abilityToDatastructure['readRowValue'],
        icon: generateIcon('branches'),
      },
      {
        description: 'writeRowValue',
        key: '0-3-4',
        item: abilityToDatastructure['writeRowValue'],
        icon: generateIcon('branches'),
      }, // closeExcel
      {
        description: 'saveExcel',
        key: '0-3-5',
        item: abilityToDatastructure['saveExcel'],
        icon: generateIcon('branches'),
      },
      {
        description: 'closeExcel',
        key: '0-3-6',
        item: abilityToDatastructure['closeExcel'],
        icon: generateIcon('branches'),
      },
      {
        description: 'newExcel',
        key: '0-3-7',
        item: abilityToDatastructure['newExcel'],
        icon: generateIcon('branches'),
      },
      {
        description: 'openSheet',
        key: '0-3-8',
        item: abilityToDatastructure['openSheet'],
        icon: generateIcon('branches'),
      }, // readColumnValue
      {
        description: 'readCellValue',
        key: '0-3-9',
        item: abilityToDatastructure['readCellValue'],
        icon: generateIcon('branches'),
      },
      {
        description: 'readColumnValue',
        key: '0-3-10',
        item: abilityToDatastructure['readColumnValue'],
        icon: generateIcon('branches'),
      },
      {
        description: 'getSheetColumnSize',
        key: '0-2-11',
        item: abilityToDatastructure['getSheetColumnSize'],
        icon: generateIcon('branches'),
      }, // writeCellValue
      {
        description: 'writeCellValue',
        key: '0-2-14',
        item: abilityToDatastructure['writeCellValue'],
        icon: generateIcon('branches'),
      },
      {
        description: 'deleteColumn',
        key: '0-2-12',
        item: abilityToDatastructure['deleteColumn'],
        icon: generateIcon('branches'),
      },
      {
        description: 'deleteRow',
        key: '0-2-13',
        item: abilityToDatastructure['deleteRow'],
        icon: generateIcon('branches'),
      }, //writeColumnValue
      {
        description: 'writeColumnValue',
        key: '0-2-15',
        item: abilityToDatastructure['writeColumnValue'],
        icon: generateIcon('branches'),
      },
      {
        description: 'newSheet',
        key: '0-2-16',
        item: abilityToDatastructure['newSheet'],
        icon: generateIcon('branches'),
      },
    ],
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
      {
        description: 'print',
        key: '0-2-3',
        item: abilityToDatastructure['print'],
        icon: generateIcon('branches'),
      }, // getSheetColumnSize
    ],
  },
];
