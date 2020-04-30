import { isArray } from './utils';
// import { transformEditorProcess } from '../../../designerGraphEdit/RPAcore/index';
import transformVariable from '../../../designerGraphEdit/RPAcore/transformVariable';
import { uuid } from '../../../common/utils';
import { resolve } from 'dns';
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
  depth
) => {
  handleModuleImport(dataStructure, result, moduleMap);
  handleNote(dataStructure.cmdDesc, result, padding, dataStructure);
  result.output += `${padding}`;
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
  // } else {
  //   console.log('没有require');
  //   if (dataStructure.graphDataMap && dataStructure.graphDataMap.cards) {
  //     const tail = uuid();
  //     const inputParamKV = dataStructure.properties
  //       .find(item => item.cnName === '输入参数')
  //       .value.map(item => `${item.name} = ${item.value}`)
  //       .join(',');
  //     const inputParamK = dataStructure.properties
  //       .find(item => item.cnName === '输入参数')
  //       .value.map(item => `${item.name}`)
  //       .join(',');
  //     const outputParam = dataStructure.properties
  //       .find(item => item.cnName === '流程块返回')
  //       .value.map(item => item.name)
  //       .join(',');
  //     const variables = transformVariable(
  //       dataStructure.graphDataMap.variable,
  //       depth + 1
  //     );
  //     if (inputParamK) {
  //       result.output += `def RPA_Atomic_${tail}(${inputParamK})\n`;
  //     } else {
  //       result.output += `def RPA_Atomic_${tail}()\n`;
  //     }

  //     result.output += `${variables}`;
  //     dataStructure.graphDataMap.cards.forEach(item => {
  //       transformBasicStatement(
  //         paddingStart(depth + 1),
  //         item,
  //         result,
  //         moduleMap,
  //         depth + 1
  //       );
  //     });
  //     if (outputParam) {
  //       result.output += `\n${paddingStart(
  //         depth
  //       )}${outputParam} = RPA_Atomic_${tail}(${inputParamKV})\n`;
  //     } else {
  //       result.output += `\n${paddingStart(
  //         depth
  //       )}RPA_Atomic_${tail}(${inputParamKV})\n`;
  //     }
  //   }
  //   // console.log(padding, dataStructure, result, moduleMap);
  // }
};

export default transformBasicStatement;
