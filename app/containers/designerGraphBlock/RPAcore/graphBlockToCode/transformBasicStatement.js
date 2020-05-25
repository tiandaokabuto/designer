import { isArray } from './utils';
import transformVariable from '../../../designerGraphEdit/RPAcore/transformVariable';
import { uuid } from '../../../common/utils';
import memoize from './reselect';
import moment from 'moment';
const fs = require('fs');

const paddingStart = length => '    '.repeat(length);

const handleModuleImport = (dataStructure, result, moduleMap) => {
  if (dataStructure.module) {
    // result.output += `from ${dataStructure.module} import ${dataStructure.pkg}\n`;
    if (moduleMap.get(dataStructure.module)) {
      let exist = moduleMap.get(dataStructure.module);
      if (isArray(exist)) {
        !exist.includes(dataStructure.pkg) &&
          (exist = exist.concat(dataStructure.pkg));
      } else {
        exist !== dataStructure.pkg && (exist = [exist, dataStructure.pkg]);
      }
      moduleMap.set(dataStructure.module, exist);
    } else {
      moduleMap.set(dataStructure.module, dataStructure.pkg);
    }
  }
};

const handleStatementOutput = (output, value, result) => {
  // result.output += `\n${output} = ${value || ''}`;
  result.output += `${output} = `;
};

const handleMainFnGeneration = (dataStructure, params, result, padding) => {
  const isSubtype = dataStructure.subtype;
  result.output += `${isSubtype ? '' : dataStructure.pkg + '.'}${
    dataStructure.main
  }(${params})\n`;
  // 如果是消费任务数据原子能力，批量生成变量名
  if (
    dataStructure.main === 'consumeData' &&
    dataStructure.properties.required[1].selectedRows
  ) {
    const selectedRows = dataStructure.properties.required[1].selectedRows;
    selectedRows.map(item => {
      if (item.variableName !== '') {
        result.output += `${padding}${item.variableName} = ${dataStructure.properties.required[0].value}['${item.headerName}']\n`;
      }
      return item;
    });
  }
};

const handleNote = (cmdDesc, result, padding, dataStructure) => {
  if (cmdDesc) {
    result.output += `${padding}`;
    result.output += `# ${dataStructure.text} -- ${cmdDesc}\n`;
  }
};

const handleFormJsonGenerate = dataStructure => {
  if (
    dataStructure.layout &&
    dataStructure.layout.data &&
    dataStructure.layout.data.length
  ) {
    const data = dataStructure.layout.data;
    const dataMap = dataStructure.layout.dataMap;
    return JSON.stringify(data.map(item => dataMap[item.i]));
  }
  return 'None';
};

const transformBasicStatement = (
  padding,
  dataStructure,
  result,
  moduleMap,
  options = {}
) => {
  const ignore = dataStructure.ignore ? '# ' : '';
  handleModuleImport(dataStructure, result, moduleMap);
  handleNote(dataStructure.cmdDesc, result, padding, dataStructure);
  result.output += `${padding}${ignore}`;
  let params = ''; // 生成参数类型
  // if (dataStructure.properties.required) {
  dataStructure.properties.required.forEach((item, index) => {
    // 文件类型选择拼接模式，将item.valueList[0]目录名和item.valueList[1]文件名拼接起来
    if (item.componentType === 2 && item.tag === 2) {
      if (params) params += ', ';
      params += `${item.enName} = ${
        !Array.isArray(item.valueList)
          ? 'None'
          : `${item.valueList[0].value} + ${item.valueList[1].value}`
      }`;
    } else {
      let isEncypt = false;
      if (dataStructure.main === 'setText' && item.enName === '_text') {
        if (dataStructure.properties.required[4]) {
          isEncypt = dataStructure.properties.required[4].value === 'True';
        }
      }
      switch (item.enName) {
        case 'outPut':
          item.value && handleStatementOutput(item.value, '', result);
          break;
        case 'formJson':
          if (params) params += ', ';
          const formJson = handleFormJsonGenerate(dataStructure);

          if (formJson !== 'None') {
            const temp = JSON.parse(formJson);
            result.output +=
              '[' +
              temp
                .filter(
                  item =>
                    !['submit-btn', 'cancel-btn', 'image'].includes(
                      item.type
                    ) || item.key
                )
                .map(item => item.key)
                .join(',') +
              ',' +
              '] = ';
            params +=
              'variables = [' +
              temp.map(item => item.value || '').join(',') +
              '], ';
          }

          params += item.enName + ' = ' + formJson;
          break;
        case 'layout':
          if (params) params += ', ';
          params += item.enName + ' = ' + JSON.stringify(dataStructure.layout);
          console.log();
          break;
        case '_text':
          if (dataStructure.main === 'setText') {
            if (params) params += ', ';
            params += `${item.enName} = `;
            if (item.default === undefined && item.value === undefined) {
              params += 'None';
            } else if (!item.value) {
              params += item.default;
            } else {
              params += isEncypt ? `'${item.value}'` : item.value;
            }
            break;
          }
        default:
          if (params) params += ', ';
          params +=
            item.enName +
            ' = ' +
            (item.default === undefined && item.value === undefined
              ? 'None'
              : !item.value
              ? item.default
              : item.value);
      }
    }
  });
  dataStructure.properties.optional &&
    dataStructure.properties.optional.forEach((item, index) => {
      if (item.value === '') return;
      if (item.componentType === 2 && item.tag === 2) {
        if (params) params += ', ';
        params += `${item.enName} = ${
          !Array.isArray(item.valueList)
            ? 'None'
            : `"${item.valueList[0].value}${item.valueList[1].value}"`
        }`;
      } else {
        switch (item.enName) {
          case 'outPut':
            handleStatementOutput(item.value, '', result);
            break;
          default:
            if (params) params += ', ';
            params += item.enName + ' = ' + item.value;
        }
      }
    });
  handleMainFnGeneration(dataStructure, params, result, padding);
  return [result.output, new Map(moduleMap)];
};

export default memoize(transformBasicStatement);
