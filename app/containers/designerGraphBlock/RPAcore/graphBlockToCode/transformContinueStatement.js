const transformContinueStatement = (padding, dataStructure, result) => {
  result.output += `${padding}`;
  result.output += `continue`;
};

export default transformContinueStatement;
