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
  while (
    labelTrue !== labelFalse &&
    labelTrue !== null &&
    labelFalse !== null
  ) {
    labelTrue = findTargetIdBySourceId(edges, labelTrue);
    labelFalse = findTargetIdBySourceId(edges, labelFalse);
    if (labelTrue === labelFalse) {
      return labelTrue;
    }
  }
  return null;
};

/**
 * 判断流程块结点存在两个输入结点
 */
export const hasTwoEntryPortInProcessBlock = (edges, id) => {
  const find = edges.filter(edge => edge.target === id);
  return find.length === 2;
};
