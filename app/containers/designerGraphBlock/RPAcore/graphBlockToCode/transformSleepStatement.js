import memoize from './reselect';
import cloneDeep from 'lodash/cloneDeep';
/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 * @param {*} moduleMap
 */
const transformSleepStatement = (padding, dataStructure, result, moduleMap) => {
  console.log('sleep ------ 执行了');
  moduleMap.set('time', 'sleep');
  result.output += `${padding}`;
  const delay = dataStructure['properties']['required'][0].value;
  result.output += `sleep( ${delay} )`;
  return [result.output, new Map(moduleMap)];
};

export default memoize(transformSleepStatement);
