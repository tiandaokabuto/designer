const transformLoopStatement = (padding, dataStructure, result) => {
  const looptype =
    dataStructure['properties']['required'][0].value === 'for_condition'
      ? 'while'
      : 'for';
  const loopcondition = dataStructure['properties']['required'][1].value;
  result.output += `${padding}${looptype} ${loopcondition}:\n`;
};

export default transformLoopStatement;
