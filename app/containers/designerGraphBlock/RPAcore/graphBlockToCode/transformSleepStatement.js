import cloneDeep from 'lodash/cloneDeep';
/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 * @param {*} moduleMap
 */
const transformSleepStatement = (
  padding,
  dataStructure,
  result,
  moduleMap,
  options
) => {
  moduleMap.set('time', 'sleep');
  const ignore = dataStructure.ignore ? '# ' : '';
  result.output += `${padding}${ignore}`;
  const delay = dataStructure['properties']['required'][0].value;
  result.output += `sleep( ${delay} )`;
  return [result.output, new Map(moduleMap)];
};

export default transformSleepStatement;
