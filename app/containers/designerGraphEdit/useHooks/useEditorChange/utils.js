import uniqueId from 'lodash/uniqueId';

export const findNodeById = (nodes, id) => {
  return nodes.find(item => item.id === id);
};

let prevId = null;
export const generateUniqueId = group => {
  let id;
  while (true) {
    id = new Date()
      .getTime()
      .toString(16)
      .slice(-8);
    if (id !== prevId && (!group || !group.find(item => item.id === id))) {
      prevId = id;
      return id;
    }
  }
};
