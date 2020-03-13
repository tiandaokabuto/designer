const transformVariableDeclar = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  const variable = dataStructure['properties']['required'][0].value;
  const initValue = dataStructure['properties']['required'][1].value;
  result.output += `${variable} = ${initValue}`;
  // if (params) {
  //   result.output += `print(${template_string}.${main_func}(${params}))`;
  // } else {
  //   result.output += `print(${template_string})`;
  // }
};

export default transformVariableDeclar;
