const fake = {
  typeof: 2,
  Children: [],
};

const paddingStart = length => '    '.repeat(length);

const handleLoopCondition = (_, result, padding) => {
  result.output += `${padding}for element in array\n`;
};

const transformLoopStatement = (dataStructure, deep) => {
  const result = {
    output: '',
  };
  const padding = paddingStart(deep);
  handleLoopCondition(undefined, result, padding);
  console.log(result.output);
};

transformLoopStatement(fake, 1);
