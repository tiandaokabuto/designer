import memoize from './reselect';
/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformCustomCodeStatement = (padding, dataStructure, result) => {
  if (dataStructure.codeValue) {
    const ignore = dataStructure.ignore ? "'''" : '';
    const buf = dataStructure.codeValue
      .split('\n')
      .map(item => padding + item)
      .join('\n');
    result.output += `${ignore}\n`;
    result.output += buf;
    result.output += `\n${ignore}`;
  }
  return result.output;
};

export default memoize(transformCustomCodeStatement);
