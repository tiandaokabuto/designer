const transformSleepStatement = (padding, dataStructure, result, moduleMap) => {
  moduleMap.set('time', 'sleep');
  result.output += `${padding}`;
<<<<<<< HEAD
=======
  console.log(dataStructure);
>>>>>>> 6f9b85961bcc756f86005d94e3b2149fec2fa7f3
  const delay = dataStructure['properties']['required'][0].value;
  result.output += `sleep( ${delay} )`;
};

export default transformSleepStatement;
