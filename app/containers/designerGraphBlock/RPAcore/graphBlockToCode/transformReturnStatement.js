const transformReturnStatement = (
  padding,
  dataStructure,
  result,
  blockNode = {}
) => {
  result.output += `${padding}`;
<<<<<<< HEAD
  const returnList =
    (blockNode.properties &&
      blockNode.properties.find(item => item.enName === 'output').value) ||
    [];
=======
  const returnList = ''.find(item => item.enName === 'output').value || [];
  // const returnList =
  //   blockNode.properties.find(item => item.enName === 'output').value || [];
>>>>>>> f9474d3... fix:开发一键恢复功能
  const return_string = dataStructure['properties']['required'][0].value.map(
    item => item.name || 'None'
  );
  return_string.length = returnList.length;
  for (let i = 0; i < return_string.length; i++) {
    if (!return_string[i]) {
      return_string[i] = 'None';
    }
  }
  result.output += `return ${return_string.join(', ')}`;
};

export default transformReturnStatement;
