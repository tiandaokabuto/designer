/**
 * (已进行单元测试)
 * @param {*} padding
 * @param {*} dataStructure
 * @param {*} result
 */
const transformConditionalStatement = (padding, dataStructure, result) => {
  const ignore = dataStructure.ignore ? '# ' : '';
  const { tag, value, valueList = [] } = dataStructure.properties.required[0];
  if (tag === 2) {
    // 自定义
    const loopcondition = dataStructure.properties.required[0].value;
    result.output += `${padding}${ignore}if ${loopcondition}:\n`;
  } else {
    // 向导
    result.output += `${padding}${ignore}if `;
    valueList.forEach((item, index) => {
      if (index === valueList.length - 1) {
        // 最后一个，不把连接符填上
        if (item.rule === 'is None' || item.rule === 'is not None') {
          result.output += `(${item.v1} ${item.rule}) `;
        } else {
          result.output += `(${item.v1} ${item.rule} ${item.v2}) `;
        }
      } else if (item.rule === 'is None' || item.rule === 'is not None') {
        result.output += `(${item.v1} ${item.rule}) ${item.connect} `;
      } else {
        result.output += `(${item.v1} ${item.rule} ${item.v2}) ${item.connect} `;
      }
    });
    result.output += `:\n`;
  }
  return result.output;
};

export default transformConditionalStatement;
