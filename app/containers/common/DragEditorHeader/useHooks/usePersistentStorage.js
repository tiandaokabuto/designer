import { useSelector } from 'react-redux';
import { persistentStorage } from '_utils/utils';

import store from '../../../../store';

export default arr => {
  return arr => {
    const {
      grapheditor: { processTree, currentProject, currentCheckedTreeNode },
    } = store.getState();
    persistentStorage(
      arr ? arr : currentCheckedTreeNode ? [currentCheckedTreeNode] : [],
      processTree,
      currentProject,
      currentCheckedTreeNode
    );
  };
};
