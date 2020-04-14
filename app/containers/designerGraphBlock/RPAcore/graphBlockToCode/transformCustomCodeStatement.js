const transformCustomCodeStatement = (padding, dataStructure, result) => {
  if (dataStructure.codeValue) {
    const buf = dataStructure.codeValue
      .split('\n')
      .map(item => padding + item)
      .join('\n');
    result.output += buf;
  }
};

export default transformCustomCodeStatement;
