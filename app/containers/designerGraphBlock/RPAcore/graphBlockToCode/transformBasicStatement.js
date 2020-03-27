import { isArray } from './utils';
import { resolve } from 'dns';
const fs = require('fs');

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

const handleMainFnGeneration = (dataStructure, params, result) => {
  const isSubtype = dataStructure.subtype;
  result.output += `${isSubtype ? '' : dataStructure.pkg + '.'}${
    dataStructure.main
  }(${params})\n`;
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

const transformBasicStatement = (padding, dataStructure, result, moduleMap) => {
  handleModuleImport(dataStructure, result, moduleMap);
  handleNote(dataStructure.cmdDesc, result, padding, dataStructure);
  result.output += `${padding}`;
  let params = ''; // 生成参数类型
  dataStructure.properties.required.forEach((item, index) => {
    switch (item.enName) {
      case 'outPut':
        item.value && handleStatementOutput(item.value, '', result);
        break;
      case 'layout':
        if (params) params += ', ';
        params += item.enName + ' = ' + JSON.stringify(dataStructure.layout);
        break;
      case 'formJson':
        if (params) params += ', ';
        params += item.enName + ' = ' + handleFormJsonGenerate(dataStructure);
        break;
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
  });
  dataStructure.properties.optional &&
    dataStructure.properties.optional.forEach((item, index) => {
      if (item.value === '') return;
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
};

export default transformBasicStatement;
