import memoize from './reselect';

/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformContinueStatement = (
  padding,
  dataStructure,
  result,
  moduleMap,
  options
) => {
  const ignore = options.ignore || dataStructure.ignore ? '# ' : '';
  result.output += `${padding}${ignore}`;
  result.output += `continue`;
  return result.output;
};

export default transformContinueStatement;
