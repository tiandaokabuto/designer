const transformSleepStatement = (padding, dataStructure, result, moduleMap) => {
  moduleMap.set('time', 'sleep');
  result.output += `${padding}`;
  console.log(dataStructure);
  const delay = dataStructure['properties']['required'][0].value;
  result.output += `sleep( ${delay} )`;
};

export default transformSleepStatement;
