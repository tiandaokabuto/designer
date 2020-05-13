import memoize from './reselect';

/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformVariableDeclar = (
  padding,
  dataStructure,
  result,
  moduleMap,
  options
) => {
  const ignore = options.ignore || dataStructure.ignore ? '# ' : '';
  result.output += `${padding}${ignore}`;
  const variable = dataStructure['properties']['required'][0].value;
  const initValue = dataStructure['properties']['required'][1].value;
  result.output += `${variable} = ${initValue}`;
  return result.output;
};

export default transformVariableDeclar;
