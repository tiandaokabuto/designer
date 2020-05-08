/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 * @param {*} moduleMap
 */
const transformSleepStatement = (padding, dataStructure, result, moduleMap) => {
  moduleMap.set('time', 'sleep');
  result.output += `${padding}`;
  const delay = dataStructure['properties']['required'][0].value;
  result.output += `sleep( ${delay} )`;
  return [result.output, moduleMap];
};

export default transformSleepStatement;
