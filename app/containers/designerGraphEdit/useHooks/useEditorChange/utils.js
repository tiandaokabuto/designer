import uniqueId from 'lodash/uniqueId';

export const findNodeById = (nodes, id) => {
  return nodes.find(item => item.id === id);
};

export const generateUniqueId = group => {
  let id;
  while (true) {
    id = uniqueId('group_');
    if (!group.find(item => item.id === id)) {
      return id;
    }
  }
};
