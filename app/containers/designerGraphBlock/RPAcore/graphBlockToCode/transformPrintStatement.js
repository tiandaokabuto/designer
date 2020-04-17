const transformPrintStatement = (padding, dataStructure, result, moduleMap) => {
  result.output += `${padding}`;
  moduleMap.set('sendiRPA.logHandler', 'logger');
  const template_string = dataStructure['properties']['required'][0].value;
  const level_string = dataStructure['properties']['required'][1].value;
  const main_func = dataStructure['properties']['optional'][0].value;
  const params = dataStructure['properties']['optional'][1].value;
  if (params) {
    result.output += `logger.${level_string}("[${level_string.toLocaleUpperCase()}]--" + ${template_string}.${main_func ||
      'format'}(${params}))`;
  } else {
    result.output += `logger.${level_string}("[${level_string.toLocaleUpperCase()}]--" + ${template_string})`;
  }
};

export default transformPrintStatement;
