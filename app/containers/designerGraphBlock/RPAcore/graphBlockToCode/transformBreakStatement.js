import memoize from './reselect';

/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformBreakStatement = (padding, dataStructure, result, options) => {
  const ignore = options.ignore || dataStructure.ignore ? '# ' : '';
  result.output += `${padding}${ignore}`;
  result.output += `break`;
  return result.output;
};

export default memoize(transformBreakStatement);
