const paddingStart = length => '    '.repeat(length);

const handleLoopCondition = (_, result, padding) => {
  // result.output += `${padding}for element in array\n`;
};

const transformLoopStatement = (padding, dataStructure, result) => {
  const looptype = dataStructure['properties']['required'][0].value;
  const loopcondition = dataStructure['properties']['required'][1].value;
  result.output += `${padding}${looptype} ${loopcondition}:\n`;
};

export default transformLoopStatement;
