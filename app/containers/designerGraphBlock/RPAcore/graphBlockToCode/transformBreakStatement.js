/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformBreakStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  result.output += `break`;
  return result.output;
};

export default transformBreakStatement;
