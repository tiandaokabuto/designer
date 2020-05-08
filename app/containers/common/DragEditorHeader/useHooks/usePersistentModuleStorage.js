import { useSelector } from 'react-redux';
import { persistentModuleStorage, persistentManifest } from '../../utils';

import store from '../../../../store';

export default () => {
  return () => {
    const {
      grapheditor: { moduleTree, currentProject, currentCheckedModuleTreeNode },
    } = store.getState();
    persistentManifest(moduleTree, currentProject, 'moduleTree');
    // persistentModuleStorage(
    //   moduleTree,
    //   currentProject,
    //   currentCheckedModuleTreeNode
    // );
  };
};
