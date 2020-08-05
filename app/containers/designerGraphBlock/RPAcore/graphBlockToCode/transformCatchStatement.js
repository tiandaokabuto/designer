const transformCatchStatement = (padding, dataStructure, result) => {
  const ignore = dataStructure.ignore ? '# ' : '';
  result.output += `${padding}${ignore}try:\n`;
  return result.output;
};

export default transformCatchStatement;
