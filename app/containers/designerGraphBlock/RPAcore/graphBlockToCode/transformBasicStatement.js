import moment from 'moment';
import { isArray } from '../../../../utils/designerGraphBlock/isArray';
import transformVariable from '../../../designerGraphEdit/RPAcore/transformVariable';
import { uuid } from '_utils/utils';
import memoize from './reselect';

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
  result.output += `${isSubtype ? '' : `${dataStructure.pkg}.`}${
    dataStructure.main
  }(${params})\n`;
  // 如果是消费任务数据原子能力，批量生成变量名
  if (
    dataStructure.main === 'consumeData' &&
    dataStructure.properties.required[1].selectedRows
  ) {
    const { selectedRows } = dataStructure.properties.required[1];
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
    const { data } = dataStructure.layout;
    data.sort((preValue, nextValue) => preValue.y - nextValue.y);
    const { dataMap } = dataStructure.layout;
    return JSON.stringify(data.map(item => dataMap[item.i]));
  }
  return 'None';
};

// 判断是否是关联属性
const isParentLink = (param, properties) => {
  let flag = false;
  if (param.parentLink) {
    properties.required.forEach(requiredItem => {
      if (requiredItem.enName === param.parentLink.enName) {
        flag = requiredItem;
      }
    });
  }
  return flag;
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
  dataStructure.properties.required.forEach((item, index) => {
    const linkFlag = isParentLink(item, dataStructure.properties);

    // 是否是关联属性
    if (linkFlag) {
      // 值是否与关联的值相等
      if (linkFlag.value.toString() === item.parentLink.value.toString()) {
        // 文件类型选择拼接模式，将item.valueList[0]目录名和item.valueList[1]文件名拼接起来
        if (item.componentType === 2 && item.tag === 2) {
          if (params) params += ', ';
          params += `${item.enName} = ${
            !Array.isArray(item.valueList)
              ? 'None'
              : `${item.valueList[0].value} + ${item.valueList[1].value}`
          }`;
        } else if (
          (dataStructure.cmdName === '键盘-按键' && item.cnName === '按键') ||
          (dataStructure.cmdName === '键盘-目标中按键' &&
            item.cnName === '按键')
        ) {
          if (params) params += ', ';
          console.log(item.value);
          if (Array.isArray(item.value)) {
            params += `${item.enName} = [${item.value
              .map(valueItem => valueItem)
              .join(',')}]`;
          } else {
            params += `${item.enName} = ${
              item.default === undefined && item.value === undefined
                ? 'None'
                : !item.value
                ? item.default
                : item.value
            }`;
          }
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
                // 返回值
                const temp = JSON.parse(formJson);
                result.output +=
                  `[${temp
                    .filter(
                      item =>
                        ![
                          'submit-btn',
                          'cancel-btn',
                          'image',
                          'file-download',
                          'file-upload',
                        ].includes(item.type) || item.key
                    )
                    .map(item => {
                      return item.key;
                    })
                    .join(',')}` + `] = `;
                // 变量
                params += `variables = [${temp
                  .filter(
                    item =>
                      !['submit-btn', 'cancel-btn', 'file-upload'].includes(
                        item.type
                      )
                  )
                  .map(item => {
                    if (item.type === 'drop-down') {
                      return `${item.value || ''},${item.dataSource || ''}`;
                    } else {
                      return item.value || '';
                    }
                  })
                  .join(',')}], `;
                const newTemp = temp.map(item => {
                  if (item.value === undefined) {
                    return item;
                  } else {
                    item.value = '';
                    return item;
                  }
                });

                params += `${item.enName} = ${JSON.stringify(newTemp)}`;
              } else {
                params += `${item.enName} = ${formJson}`;
              }

              break;
            case 'layout':
              if (params) params += ', ';
              params += `${item.enName} = ${JSON.stringify(
                dataStructure.layout
              )}`;
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
              params += `${item.enName} = ${
                item.default === undefined && item.value === undefined
                  ? 'None'
                  : !item.value
                  ? item.default
                  : item.value
              }`;
          }
        }
      }
    } else {
      if (item.componentType === 2 && item.tag === 2) {
        if (params) params += ', ';
        params += `${item.enName} = ${
          !Array.isArray(item.valueList)
            ? 'None'
            : `${item.valueList[0].value} + ${item.valueList[1].value}`
        }`;
      } else if (
        (dataStructure.cmdName === '键盘-按键' && item.cnName === '按键') ||
        (dataStructure.cmdName === '键盘-目标中按键' && item.cnName === '按键')
      ) {
        if (params) params += ', ';
        console.log(item.value);
        if (Array.isArray(item.value)) {
          params += `${item.enName} = [${item.value
            .map(valueItem => valueItem)
            .join(',')}]`;
        } else {
          params += `${item.enName} = ${
            item.default === undefined && item.value === undefined
              ? 'None'
              : !item.value
              ? item.default
              : item.value
          }`;
        }
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
              // 返回值
              const temp = JSON.parse(formJson);
              result.output +=
                `[${temp
                  .filter(
                    item =>
                      ![
                        'submit-btn',
                        'cancel-btn',
                        'image',
                        'file-download',
                        'file-upload',
                      ].includes(item.type) || item.key
                  )
                  .map(item => {
                    return item.key;
                  })
                  .join(',')}` + `] = `;
              // 变量
              params += `variables = [${temp
                .filter(
                  item =>
                    !['submit-btn', 'cancel-btn', 'file-upload'].includes(
                      item.type
                    )
                )
                .map(item => {
                  if (item.type === 'drop-down') {
                    return `${item.value || ''},${item.dataSource || ''}`;
                  } else {
                    return item.value || '';
                  }
                })
                .join(',')}], `;
              const newTemp = temp.map(item => {
                if (item.value === undefined) {
                  return item;
                } else {
                  item.value = '';
                  return item;
                }
              });

              params += `${item.enName} = ${JSON.stringify(newTemp)}`;
            } else {
              params += `${item.enName} = ${formJson}`;
            }

            break;
          case 'layout':
            if (params) params += ', ';
            params += `${item.enName} = ${JSON.stringify(
              dataStructure.layout
            )}`;
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
            params += `${item.enName} = ${
              item.default === undefined && item.value === undefined
                ? 'None'
                : !item.value
                ? item.default
                : item.value
            }`;
        }
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
            params += `${item.enName} = ${item.value}`;
        }
      }
    });
  handleMainFnGeneration(dataStructure, params, result, padding);
  return [result.output, new Map(moduleMap)];
};

export default memoize(transformBasicStatement);
