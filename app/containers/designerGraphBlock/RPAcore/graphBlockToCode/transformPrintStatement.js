const transformPrintStatement = (dataStructure, result) => {
  const template_string = dataStructure['properties']['required'][0].value;
  const main_func = dataStructure['properties']['optional'][0].value;
  const params = dataStructure['properties']['optional'][1].value;
  if (params) {
    result.output += `print(${template_string}.${main_func}(${params}))`;
  } else {
    result.output += `print(${template_string})`;
  }
};

export default transformPrintStatement;
