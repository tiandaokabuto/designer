import { useDispatch, useSelector } from 'react-redux';
import { findNodeLevelById, findNodeById } from '../shared/utils';
import { CHANGE_CARDDATA } from '../../../../actions/codeblock';

export default () => {
  const cards = useSelector(state => state.blockcode.cards);
  const dispatch = useDispatch();
  return (id, xpath) => {
    const node = findNodeById(cards, id);
    node['properties']['required'].find(
      item => item.enName === 'xpath'
    ).value = `"${xpath}"`;
    dispatch({
      type: CHANGE_CARDDATA,
      payload: [...cards],
    });
  };
};
