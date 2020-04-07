import { useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDebounce from 'react-hook-easier/lib/useDebounce';
import { transformBlockToCode } from '../../RPAcore';
import { CHANGE_PYTHONCODE } from '../../../../actions/codeblock';
import { changeModifyState } from '../../../common/utils';

let transformCount = 0;

export default () => {
  const dispatch = useDispatch();
  const currentPagePosition = useSelector(
    state => state.temporaryvariable.currentPagePosition
  );
  const currentPagePositionRef = useRef(null);
  currentPagePositionRef.current = currentPagePosition;

  const currentCheckedTreeNode = useSelector(
    state => state.grapheditor.currentCheckedTreeNode
  );
  const currentCheckedTreeNodeRef = useRef(null);
  currentCheckedTreeNodeRef.current = currentCheckedTreeNode;

  const processTree = useSelector(state => state.grapheditor.processTree);

  const processTreeRef = useRef(null);
  processTreeRef.current = processTree;

  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};
  const blockNodeRef = useRef(null);
  blockNodeRef.current = blockNode;

  const handleEmitCodeTransform = useCallback(
    useDebounce(cards => {
      const result = transformBlockToCode(cards, 0, blockNodeRef.current);
      if (transformCount && currentPagePositionRef.current === 'block') {
        changeModifyState(processTreeRef.current, currentCheckedTreeNode, true);
      }
      transformCount++;

      if (currentPagePositionRef.current === 'block') {
        dispatch({
          type: CHANGE_PYTHONCODE,
          payload: result.output,
        });
      }
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
