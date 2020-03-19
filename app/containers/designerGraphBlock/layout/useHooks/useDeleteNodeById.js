import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { findNodeLevelById } from '../shared/utils';

import { CHANGE_CARDDATA } from '../../../../actions/codeblock';

export default id => {
  const cards = useSelector(state => state.blockcode.cards);
  const checkedId = useSelector(state => state.blockcode.checkedId);
  const dispatch = useDispatch();
  const handleDeleteNodeById = useCallback(
    node_id => {
      const node_level = findNodeLevelById(cards, node_id);
      if (node_level) {
        const index = node_level.findIndex(item => item.id === node_id);
        node_level.splice(index, 1);
        dispatch({
          type: CHANGE_CARDDATA,
          payload: [...cards],
        });
      }
    },
    [cards, dispatch]
  );

  useEffect(() => {
    const handleDeleteKeyDown = e => {
      if (e.keyCode === 46) {
        if (checkedId === id) {
          handleDeleteNodeById(id);
        }
      }
    };
    document.addEventListener('keydown', handleDeleteKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDeleteKeyDown);
    };
  }, [handleDeleteNodeById, id, checkedId]);
  return handleDeleteNodeById;
};
