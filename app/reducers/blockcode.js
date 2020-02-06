/**
 * 代码块流程数据
 */

import { CHANGE_CARDDATA, CHANGE_CHECKEDID } from '../actions/codeblock';

const defaultState = {
  cards: [],
  checkedId: undefined,
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
    default:
      return state;
  }
};
