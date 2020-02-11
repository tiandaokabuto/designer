import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useDebounce from 'react-hook-easier/lib/useDebounce';
import { transformBlockToCode } from '../../RPAcore';
import { CHANGE_PYTHONCODE } from '../../../../actions/codeblock';

export default () => {
  const dispatch = useDispatch();
  const handleEmitCodeTransform = useCallback(
    useDebounce(cards => {
      const result = transformBlockToCode(cards);
      dispatch({
        type: CHANGE_PYTHONCODE,
        payload: result.output,
      });
    }, 800),
    []
  );
  return handleEmitCodeTransform;
};
