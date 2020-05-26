import { useDispatch, useSelector } from 'react-redux';
import { findNodeLevelById, findNodeById } from '../shared/utils';
import { CHANGE_CARDDATA } from '../../../../actions/codeblock';

export default () => {
  const cards = useSelector((state) => state.blockcode.cards);
  const dispatch = useDispatch();
  return (id, xpath) => {
    const node = findNodeById(cards, id);
    const find = node['properties']['required'].find(
      (item) => item.enName === 'xpath'
    );
    if (!find) return;
    find.value = '';
    find.config = {
      XPath: ["//a[text()='工单管理']", '/html/body/div[1]/ul[1]/li[2]/a[1]'],
      JSpath:
        'body > div:nth-child(1) > ul:nth-child(4) > li:nth-child(2) > a:nth-child(1)',
      iframe: ["//iframe[@id='myIframe']", "//frame[@name='topFrame']"],
    };
    // find.value = `"${xpath}"`;
    find.updateId = true;
    dispatch({
      type: CHANGE_CARDDATA,
      payload: [...cards],
    });
  };
};
