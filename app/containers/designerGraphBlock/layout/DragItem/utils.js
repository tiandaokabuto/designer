import { traverseTree } from '../../../common/utils';
import { writeGlobalConfig } from '../../../../login/utils';

export const findNodeByKey = (tree, key) => {
  for (const child of tree) {
    if (child.key === key) {
      return child;
    }
    if (child.children) {
      let bool = findNodeByKey(child.children, key);
      if (bool) return bool;
    }
  }
  return false;
};

export const saveAutomicList = automicList => {
  traverseTree(automicList, node => {
    if (node.pKey === -1) {
      node.icon = null;
      if (node.title && typeof node.title === 'object') {
        node.title = null;
      }
    } else {
      node.icon = null;
      if (node.title && typeof node.title === 'object') {
        node.title = null;
      }
    }
  });

  writeGlobalConfig({
    automicList,
  });
};
