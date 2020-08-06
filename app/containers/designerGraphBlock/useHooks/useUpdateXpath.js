import { useDispatch, useSelector } from 'react-redux';
import {
  findNodeLevelById,
  findNodeById,
} from '../../../utils/GraphBlockUtils/utils';
import { CHANGE_CARDDATA } from '../../../constants/actions/codeblock';

export default () => {
  const cards = useSelector(state => state.blockcode.cards);
  const dispatch = useDispatch();
  return (id, xpath, type) => {
    const node = findNodeById(cards, id);
    const find = node.properties.required.find(item => item.enName === 'xpath');
    if (!find) return;
    if (type !== 'win') {
      const { XPath, JSpath, iframe } = xpath;
      const setValue = xpath => {
        find.value = JSON.stringify(
          JSON.stringify({
            XPath: xpath,
            iframe,
          })
        );
        return true;
      };
      find.config = {
        XPath: XPath.map((xpath, key) => ({
          xpath,
          key,
          checked: key === 0 ? setValue(xpath) : false,
        })),
        JSpath: JSpath.map((xpath, key) => ({
          xpath,
          key,
          checked: key === 0,
        })),
        selectedOption: 'xpath',
        iframe,
      };

      find.updateId = true;
    } else {
      find.value = `"${xpath}"`;
      find.updateId = true;
    }

    dispatch({
      type: CHANGE_CARDDATA,
      payload: [...cards],
    });
  };
};
