/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformContinueStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  result.output += `continue`;
  return result.output;
};

export default transformContinueStatement;
