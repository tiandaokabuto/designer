import {
  CHANGE_GRAPHDATA,
  SET_GRAPHDATAMAP,
  DELETE_GRAPHDATAMAP,
  CLEAR_GRAPHDATAMAP,
} from '../actions/grapheditor';

const defaultState = {
  graphData: {},
  graphDataMap: new Map(), // 保存针对每个流程图的数据结构
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case CHANGE_GRAPHDATA:
      return {
        ...state,
        graphData: action.payload,
      };
    case SET_GRAPHDATAMAP:
      return {
        ...state,
        graphDataMap: state.graphDataMap.set(payload.key, payload.value),
      };
    case DELETE_GRAPHDATAMAP:
      return {
        ...state,
        graphDataMap: state.graphDataMap.delete(payload.key),
      };
    case CLEAR_GRAPHDATAMAP:
      return {
        ...state,
        graphDataMap: new Map(),
      };
    default:
      return state;
  }
};
