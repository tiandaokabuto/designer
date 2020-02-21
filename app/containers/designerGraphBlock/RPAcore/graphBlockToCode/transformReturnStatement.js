const transformReturnStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  const return_string = dataStructure['properties']['required'][0].value;
  result.output += `return ${return_string}`;
<<<<<<< HEAD
=======
  // if (params) {
  //   result.output += `print(${template_string}.${main_func}(${params}))`;
  // } else {
  //   result.output += `print(${template_string})`;
  // }
>>>>>>> af58d69453e4d7a5def2d8fba22565019b595077
};

export default transformReturnStatement;
