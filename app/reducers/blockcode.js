/**
 * 代码块流程数据
 */

import {
  CHANGE_CARDDATA,
  CHANGE_CHECKEDID,
  CHANGE_PYTHONCODE,
} from '../actions/codeblock';

import { synchroGraphDataMap } from '../containers/reduxActions';

const defaultState = {
  cards: [],
  checkedId: undefined,
  pythonCode: '',
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case CHANGE_CARDDATA:
      return {
        ...state,
        cards: action.payload,
      };
    case CHANGE_CHECKEDID:
      return {
        ...state,
        checkedId: action.payload,
      };
    case CHANGE_PYTHONCODE:
      // 同步更新最新的流程块的结构到 graphDataMap 注意要放在事件循环的下次来做 否则会报错
      setTimeout(() => {
        synchroGraphDataMap(state.cards, action.payload);
      }, 0);
      console.log(state.cards, action.payload);
      return {
        ...state,
        pythonCode: action.payload,
      };
    default:
      return state;
  }
};
