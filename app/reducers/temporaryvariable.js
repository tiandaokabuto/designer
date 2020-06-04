import {
  UPDATE_EXECUTEOUTPUT,
  UPDATE_CURRENTPAGEPOSITION,
} from '../actions/temporaryvariable';

const defaultState = {
  executeOutput: [], // 当前流程的日志输出
  currentPagePosition: 'editor', // 当前所处的页面位置 'editor -- 流程图' 'block --- '代码块'
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_EXECUTEOUTPUT:
      return {
        ...state,
        executeOutput: action.payload,
      };
    case UPDATE_CURRENTPAGEPOSITION:
      return {
        ...state,
        currentPagePosition: action.payload,
      };
    default:
      return state;
  }
};
