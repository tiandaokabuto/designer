import { useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDebounce from 'react-hook-easier/lib/useDebounce';
import { transformBlockToCode } from '../../RPAcore';
import { CHANGE_PYTHONCODE } from '../../../../actions/codeblock';
import { changeModifyState } from '../../../common/utils';

let transformCount = 0;

export default () => {
  const dispatch = useDispatch();
  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );
  const currentCheckedTreeNodeRef = useRef(null);
  currentCheckedTreeNodeRef.current = currentCheckedTreeNode;
  const processTree = useSelector(state => state.grapheditor.processTree);
  const processTreeRef = useRef(null);
  processTreeRef.current = processTree;
  const handleEmitCodeTransform = useCallback(
    useDebounce(cards => {
      const result = transformBlockToCode(cards);
      if (transformCount) {
        changeModifyState(processTreeRef.current, currentCheckedTreeNode, true);
      }
      transformCount++;

      dispatch({
        type: CHANGE_PYTHONCODE,
        payload: result.output,
      });
    }, 800),
    []
  );
  useEffect(() => {
    return () => {
      transformCount = 0;
    };
  }, []);
  return handleEmitCodeTransform;
};
