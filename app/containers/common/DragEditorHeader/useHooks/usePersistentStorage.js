import { useSelector } from 'react-redux';
import { persistentStorage } from '../../utils';

export default () => {
  const processTree = useSelector(state => state.grapheditor.processTree);
  const currentProject = useSelector(state => state.grapheditor.currentProject);
  return () => {
    persistentStorage(processTree, currentProject);
  };
};
