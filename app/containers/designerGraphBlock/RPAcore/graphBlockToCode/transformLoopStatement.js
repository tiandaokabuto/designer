const transformLoopStatement = (padding, dataStructure, result) => {
  console.log(dataStructure, 'dataStructure');
  const select = dataStructure['properties']['required'][0].value;
  const node = dataStructure['properties']['required'][1];
  const valueConditionList = node.valueList;
  let loopcondition = '';
  const looptype = select === 'for_condition' ? 'while' : 'for';
  if (select === 'for_list' && node[select]) {
    loopcondition = `${node[select][0].value} in ${node[select][1].value}`;
  } else if (select === 'for_dict' && node[select]) {
    loopcondition = `${node[select][0].value},${node[select][1].value} in ${node[select][2].value}.items()`;
  } else if (select === 'for_times' && node[select]) {
    loopcondition = `${node[select][0].value} in range(${node[select][1].value},${node[select][2].value},${node[select][3].value})`;
  } else if (select === 'for_condition' && node.tag === 2) {
    loopcondition = node.value;
  } else if (
    select === 'for_condition' &&
    node.tag === 1 &&
    Array.isArray(valueConditionList)
  ) {
    loopcondition = '';
    valueConditionList.forEach((item, index) => {
      if (index === valueConditionList.length - 1) {
        // 最后一个，不把连接符填上
        if (item.rule === 'is None' || item.rule === 'not None') {
          loopcondition += `(${item.v1} ${item.rule}) `;
        } else {
          loopcondition += `(${item.v1} ${item.rule} ${item.v2}) `;
        }
      } else {
        if (item.rule === 'is None' || item.rule === 'not None') {
          loopcondition += `(${item.v1} ${item.rule}) ${item.connect} `;
        } else {
          loopcondition += `(${item.v1} ${item.rule} ${item.v2}) ${item.connect} `;
        }
      }
    });
  }
  result.output += `${padding}${looptype} ${loopcondition}:\n`;
  return result.output;
};

export default transformLoopStatement;
