const fs = require('fs');

const fake = {
  typeof: 1,
  id: 'node_1',
  cmdName: '启动新的浏览器',
  text: '启动$1，并将此浏览器作为控对象，赋值给$0', // 代码的描述文字
  template: `启动$1，并将此浏览器作为控对象，赋值给$0`,
  module: 'lcy',
  pkg: 'Browser',
  main: 'startChrome',
  output: 'hWeb',
  outputDesc: '输出说明：返回是否启动成功',
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
        enName: 'browserType',
        value: '谷歌chrome浏览器',
        default: '谷歌chrome浏览器',
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
      {
        enName: 'test',
        value: 'hhh',
      },
    ],
    optional: [
      {
        cnName: '错误继续执行',
        bContinueOnError: '',
        value: '否',
        default: '否',
      },
    ],
  },
};

const fake1 = {
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
    ],
    optional: [],
  },
};

const handleModuleImport = (dataStructure, result) => {
  if (dataStructure.module) {
    result.output += `from ${dataStructure.module} import ${dataStructure.pkg}\n`;
  }
};

const handleStatementOutput = (output, value, result) => {
  // result.output += `\n${output} = ${value || ''}`;
  result.output += `${output} = `;
};

const handleMainFnGeneration = (dataStructure, params, result) => {
  result.output += `${dataStructure.pkg}.${dataStructure.main}(${params})\n`;
};

const transformBasicStatement = (dataStructure, result) => {
  console.log(dataStructure);
  handleModuleImport(dataStructure, result);
  let params = ''; // 生成参数类型
  dataStructure.properties.required.forEach((item, index) => {
    switch (item.enName) {
      case 'outPut':
        handleStatementOutput(item.value, '', result);
        break;
      default:
        if (params) params += ', ';
        params += item.enName + ' = ' + item.value;
    }
  });
  dataStructure.properties.optional.forEach((item, index) => {
    switch (item.enName) {
      case 'outPut':
        handleStatementOutput(item.value, '', result);
        break;
      default:
        if (params) params += ', ';
        params += item.enName + ' = ' + item.value;
    }
  });
  handleMainFnGeneration(dataStructure, params, result);

  // fs.writeFileSync('./test.py', result.output);
  // return '213';
  // console.log(result.output);
};

export default transformBasicStatement;

// transformBasicStatement(fake1);
