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
