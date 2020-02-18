const transformConditionalStatement = (padding, dataStructure, result) => {
  // const looptype = dataStructure['properties']['required'][0].value;
  // const loopcondition = dataStructure['properties']['required'][1].value;
  // result.output += `${padding}${looptype} ${loopcondition}:\n`;
  const loopcondition = dataStructure['properties']['required'][0].value;
  result.output += `${padding}if ${loopcondition}:\n`;
};

export default transformConditionalStatement;
