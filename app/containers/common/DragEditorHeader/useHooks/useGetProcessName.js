import { findNodeByKey } from '_utils/utils';

import store from '../../../../store';

export const isEffectProcess = () => {
  const {
    grapheditor: { currentCheckedTreeNode, processTree },
  } = store.getState();
  if (!currentCheckedTreeNode) return false;
  const node = findNodeByKey(processTree, currentCheckedTreeNode);
  if (!node) return false;
  if (node.type !== 'process') {
    return false;
  }
  return node;
};

export default () => {
  return () => {
    const node = isEffectProcess();
    return node ? node.title : false;
  };
};
