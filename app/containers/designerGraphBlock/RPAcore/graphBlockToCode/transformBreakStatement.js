const transformBreakStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  result.output += `break`;
};

export default transformBreakStatement;
