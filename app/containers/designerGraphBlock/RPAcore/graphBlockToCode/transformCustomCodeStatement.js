import memoize from './reselect';
/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformCustomCodeStatement = (padding, dataStructure, result) => {
  if (dataStructure.codeValue) {
    const buf = dataStructure.codeValue
      .split('\n')
      .map((item) => padding + item)
      .join('\n');
    result.output += buf;
  }
  return result.output;
};

export default memoize(transformCustomCodeStatement);
