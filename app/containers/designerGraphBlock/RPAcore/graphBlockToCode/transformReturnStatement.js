/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 * @param {*} blockNode
 */
const transformReturnStatement = (
  padding,
  dataStructure,
  result,
  blockNode = {},
  options
) => {
  console.log(dataStructure);
  console.log(blockNode);
  const ignore = dataStructure.ignore ? '# ' : '';
  result.output += `${padding}${ignore}`;
  const returnList =
    (blockNode.properties &&
      blockNode.properties.find(item => item.enName === 'output').value) ||
    [];
  const return_string = dataStructure.properties.required[0].value.map(
    item => item.name || 'None'
  );

  return_string.length = returnList.length;
  for (let i = 0; i < return_string.length; i++) {
    if (!return_string[i]) {
      return_string[i] = 'None';
    }
  }
  console.log(returnList);
  console.log(return_string);
  result.output += `return ${return_string.join(', ')}`;
  return result.output;
};

export default transformReturnStatement;
