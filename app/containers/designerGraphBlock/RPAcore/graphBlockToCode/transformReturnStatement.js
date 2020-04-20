const transformReturnStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  const return_string = dataStructure['properties']['required'][0].value.map(
    item => item.name || 'None'
  );
  result.output += `return ${return_string.join(', ')}`;
};

export default transformReturnStatement;
