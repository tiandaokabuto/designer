import { useSelector } from 'react-redux';
import { persistentModuleStorage } from '../../utils';

import store from '../../../../store';

export default () => {
  return () => {
    const {
      grapheditor: { moduleTree, currentProject, currentCheckedModuleTreeNode },
    } = store.getState();
    persistentModuleStorage(
      moduleTree,
      currentProject,
      currentCheckedModuleTreeNode
    );
  };
};
