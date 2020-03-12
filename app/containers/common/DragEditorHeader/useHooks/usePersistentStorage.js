import { useSelector } from 'react-redux';
import { persistentStorage } from '../../utils';

import store from '../../../../store';

export default () => {
  return () => {
    const {
      grapheditor: { processTree, currentProject },
    } = store.getState();
    console.log(processTree, currentProject);
    persistentStorage(processTree, currentProject);
  };
};
