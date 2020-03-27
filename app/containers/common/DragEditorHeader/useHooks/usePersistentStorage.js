import { useSelector } from 'react-redux';
import { persistentStorage } from '../../utils';

import store from '../../../../store';

export default () => {
  return () => {
    const {
      grapheditor: { processTree, currentProject, currentCheckedTreeNode },
    } = store.getState();
    persistentStorage(processTree, currentProject, currentCheckedTreeNode);
  };
};
