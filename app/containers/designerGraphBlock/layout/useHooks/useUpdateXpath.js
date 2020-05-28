import { useDispatch, useSelector } from 'react-redux';
import { findNodeLevelById, findNodeById } from '../shared/utils';
import { CHANGE_CARDDATA } from '../../../../actions/codeblock';

export default () => {
  const cards = useSelector((state) => state.blockcode.cards);
  const dispatch = useDispatch();
  return (id, data) => {
    const node = findNodeById(cards, id);
    const find = node['properties']['required'].find(
      (item) => item.enName === 'xpath'
    );
    if (!find) return;
    const { XPath, JSpath, iframe } = data;
    find.config = {
      XPath: XPath.map((xpath, key) => ({
        xpath,
        key,
        checked: key === 0 ? true : false,
      })),
      JSpath: JSpath.map((xpath, key) => ({
        xpath,
        key,
        checked: key === 0 ? true : false,
      })),
      selectedOption: 'xpath',
      iframe,
    };

    find.value = '""';
    find.updateId = true;
    dispatch({
      type: CHANGE_CARDDATA,
      payload: [...cards],
    });
  };
};
