const transformReturnStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  const return_string = dataStructure['properties']['required'][0].value;
  result.output += `return ${return_string}`;
  // if (params) {
  //   result.output += `print(${template_string}.${main_func}(${params}))`;
  // } else {
  //   result.output += `print(${template_string})`;
  // }
};

export default transformReturnStatement;
