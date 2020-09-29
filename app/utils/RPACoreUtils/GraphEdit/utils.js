export const findNodeIdByShape = (nodes, shape) => {
  const find = nodes.find(node => node.shape === shape);
  return find ? find.id : null;
};

export const findStartNode = nodes => {
  return findNodeIdByShape(nodes, 'start-node');
};

export const findTargetIdBySourceId = (edges, sourceId) => {
  const find = edges.find(edge => edge.source === sourceId);
  return find ? find.target : null;
};

export const findNodeById = (nodes, id) => {
  return nodes.find(node => node.id === id);
};

export const findNodeByLabelAndId = (edges, sourceId, label) => {
  const find = edges.find(
    edge => edge.source === sourceId && edge.label === label
  );
  return find ? find.target : null;
};

export const isCircleExist = (edges, id, anchor) => {
  if (id === null) return false;
  let searchId = id;
  let flag = false;
  let targetId = null;
  while (((targetId = findTargetIdBySourceId(edges, searchId)), targetId)) {
    if (targetId === anchor) {
      flag = true;
      break;
    }
    searchId = targetId;
  }
  return flag;
};

export const findCommonTarget = (edges, labelTrue, labelFalse) => {
  if (labelTrue === null || labelFalse === null) {
    return null;
  }
  const labelTruePath = [labelTrue];
  const labelFalsePath = [labelFalse];

  const hasDumplate = (a1, a2) => a1.filter(item => a2.includes(item)).length;
  while (
    labelTrue !== labelFalse &&
    labelTrue !== null &&
    labelFalse !== null
  ) {
    labelTrue = findTargetIdBySourceId(edges, labelTrue);
    labelFalse = findTargetIdBySourceId(edges, labelFalse);
    if (labelTrue) {
      labelTruePath.push(labelTrue);
    }
    if (labelFalse) {
      labelFalsePath.push(labelFalse);
    }

    if (hasDumplate(labelTruePath, labelFalsePath)) {
      return labelTrue;
    }
  }
  return null;
};

export const hasTwoEntryPoint = (edges, id) => {
  const find = edges.filter(edge => edge.target === id);
  return find.length === 2;
};

/**
 * 判断流程块结点存在两个输入结点
 */
export const hasTwoEntryPortInProcessBlock = (edges, id) => {
  const find = edges.filter(edge => edge.target === id);
  return (
    find.length === 2 &&
    find.filter(edge => ['是', '否'].includes(edge.label)).length === 1
  );
};

export const isEdgeConnectWithRhombusNode = (dataMap, id) => {
  return !!dataMap[id] && dataMap[id].shape === 'rhombus-node';
};

export const transformVariable = (variable, depth = 1) => {
  if (!variable.length) return '';
  const padding = length => '    '.repeat(length);
  return (
    variable
      .map(item => padding(depth) + item.name + ' = ' + item.value)
      .join('\n') + '\n'
  );
};

export const findStartProcessBlockInContain = (nodes, edges, id, typeTag) => {
  console.log(nodes, edges, id);
  let childrens = [];

  let type = [];
  if (typeTag === 'try') {
    type = ['catch', 'finally'];
  } else if (typeTag === 'catch') {
    type = ['try', 'finally'];
  } else if (typeTag === 'finally') {
    type = ['try', 'catch'];
  } else {
    type = [];
  }
  childrens = nodes.filter(
    item => item.parent === id && !type.includes(item.shape)
  );
  let startNodeEdge = [];
  let targetNodeEdge = [];

  // 从容器里找一个起始点
  if (childrens.length === 1) {
    // 1. 容器里面只有一个流程块，直接返回id
    return childrens[0].id;
  } else if (childrens.length > 1) {
    // 2. 容器里面有其他流程块，起始点应该只有出的线，没有入的线，返回这条边

    // childrens.forEach(item => {
    //   startNodeEdge = edges.filter(edge => edge.target === item.id);
    // });

    for (let i = 0; i < childrens.length; i++) {
      startNodeEdge = edges.filter(edge => edge.target === childrens[i].id);
      if (startNodeEdge.length === 1) {
        startNodeEdge = undefined;
      } else {
        return childrens[i];
      }
    }
    // childrens.forEach(item => {
    // if (!startNodeEdge) {
    //   startNodeEdge = edges.filter(edge => edge.target === item.id);
    // }
    // startNodeEdge = edge.filter(edge => edge.source === item.id)
    // if(startNodeEdge.length !== 1) {

    // }
    // });
  } else {
    // 3. try里面没有流程块的情况
    return startNodeEdge;
  }

  // const find = edges.filter(edge => edge.)
};

export const findCatchFinallyNode = (nodes, edges, id) => {
  const childrens = nodes.filter(
    item => item.parent === id && ['catch', 'finally'].includes(item.shape)
  );
  return childrens;
};

export const translateGroup = (blockData, type) => {
  // 选择的循环类型
  const select = blockData['properties'][1].value
    ? blockData['properties'][1].value
    : blockData['properties'][1].default;

  const node = blockData['properties'][2];
  const valueConditionList = node.valueList;
  let loopcondition = '';
  const looptype = select === 'for_condition' ? 'while' : 'for';
  if (select === 'for_list' && node[select]) {
    loopcondition =
      type === 'chinese'
        ? `用 ${node[select][0].value} 遍历数据 ${node[select][1].value}`
        : `${node[select][0].value} in ${node[select][1].value}`;
    // loopcondition = `用 ${node[select][0].value} 遍历数据 ${node[select][1].value}`;
  } else if (select === 'for_dict' && node[select]) {
    loopcondition =
      type === 'chinese'
        ? `用 ${node[select][0].value}, ${node[select][1].value} 遍历 ${node[select][2].value}`
        : `${node[select][0].value},${node[select][1].value} in ${node[select][2].value}.items()`;
    // loopcondition = `用 ${node[select][0].value}, ${node[select][1].value} 遍历 ${node[select][2].value}`;
  } else if (select === 'for_times' && node[select]) {
    loopcondition =
      type === 'chinese'
        ? `${node[select][0].value} 从 ${node[select][1].value} 到 ${node[select][2].value}, 每次增加 ${node[select][3].value}`
        : `${node[select][0].value} in range(${node[select][1].value},${node[select][2].value},${node[select][3].value})`;
    // loopcondition = `${node[select][0].value} 从 ${node[select][1].value} 到 ${node[select][2].value}, 每次增加 ${node[select][3].value}`;
  } else if (select === 'for_condition' && node.tag === 2) {
    // loopcondition = `当 ${node.value} 成立时`;
    loopcondition = type === 'chinese' ? `当 ${node.value} 成立时` : node.value;
  } else if (
    select === 'for_condition' &&
    node.tag === 1 &&
    Array.isArray(valueConditionList)
  ) {
    // loopcondition = '当 ';
    loopcondition = type === 'chinese' ? '当' : '';
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
    if (type === 'chinese') {
      loopcondition += ' 成立时';
    }
    // loopcondition += ' 成立时';
  }
  // console.log(`${looptype} ${loopcondition}`);
  return type === 'chinese'
    ? `${loopcondition}`
    : `${looptype} ${loopcondition}`;
  // return `${loopcondition}`;
};
