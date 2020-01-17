const fake = {
  typeof: 3,
  ifChildren: [],
  elseChildren: [],
};

const paddingStart = length => '    '.repeat(length);

const handleIfChildren = () => {};

const handleElseChildren = () => {};

const transformConditionalStatement = (dataStructure, deep) => {
  const result = {
    output: '',
  };
  const padding = paddingStart(deep);
  if (dataStructure.ifChildren.length) {
    handleIfChildren(dataStructure.ifChildren, deep);
  }
  if (dataStructure.elseChildren.length) {
    handleElseChildren(dataStructure.elseChildren, deep);
  }
};

transformConditionalStatement(fake, 2);
