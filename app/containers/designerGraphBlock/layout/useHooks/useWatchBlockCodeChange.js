import { useRef } from 'react';
import { useSelector } from 'react-redux';
import useUpdateEffect from 'react-hook-easier/lib/useUpdateEffect';

import { changeModifyState } from '../../../common/utils';
import store from '../../../../store';

export default cards => {
  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );
  const processTree = useSelector(state => state.grapheditor.processTree);
  const processTreeRef = useRef(null);
  processTreeRef.current = processTree;
  useUpdateEffect(() => {
    changeModifyState(processTreeRef.current, currentCheckedTreeNode, true);
  }, [cards, currentCheckedTreeNode]);
  return () => {
    changeModifyState(processTreeRef.current, currentCheckedTreeNode, true);
  };
};
