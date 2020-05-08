const transformVariableDeclar = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  const variable = dataStructure['properties']['required'][0].value;
  const initValue = dataStructure['properties']['required'][1].value;
  result.output += `${variable} = ${initValue}`;
};

export default transformVariableDeclar;
