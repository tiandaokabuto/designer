const padding = length => '    '.repeat(length);

export default (variable, depth = 1) => {
  if (!variable.length) return '';
  return (
    variable
      .map(item => padding(depth) + item.name + ' = ' + item.value)
      .join('\n') + '\n'
  );
};
