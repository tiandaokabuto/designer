const transformCustomCodeStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  result.output += dataStructure.codeValue + '\n';
  console.log(dataStructure);
  // const variable = dataStructure['properties']['required'][0].value;
  // const initValue = dataStructure['properties']['required'][1].value;
  // result.output += `${variable} = ${initValue}`;
};

export default transformCustomCodeStatement;
