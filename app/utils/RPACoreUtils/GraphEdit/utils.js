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
  } else {
    type = ['try', 'catch'];
  }
  childrens = nodes.filter(
    item => item.parent === id && !type.includes(item.shape)
  );
  let startNodeEdge = undefined;

  // 从try的流程块里找一个起始点
  if (childrens.length === 1) {
    // 1. try里面只有一个流程块，直接返回id
    return childrens[0].id;
  } else if (childrens.length > 1) {
    // 2. try里面有其他流程块，起始点应该只有出的线，没有入的线，返回这条边
    for (let i = 1; i < childrens.length; i++) {
      startNodeEdge = edges.filter(
        edge =>
          edge.source === childrens[i].id || edge.target === childrens[i].id
      );
      if (startNodeEdge.length === 1) {
        return startNodeEdge[0];
      } else {
        startNodeEdge = undefined;
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
