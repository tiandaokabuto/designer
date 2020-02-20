import {
  CHANGE_GRAPHDATA,
  SET_GRAPHDATAMAP,
  DELETE_GRAPHDATAMAP,
  CLEAR_GRAPHDATAMAP,
  CHANGE_CURRENTEDITINGBLOCKID,
  SYNCHRO_GRAPHDATAMAP,
} from '../actions/grapheditor';

const defaultState = {
  graphData: {},
  graphDataMap: new Map(), // 保存针对每个流程图的数据结构
  currentEditingId: undefined,
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
    case CHANGE_CURRENTEDITINGBLOCKID:
      return {
        ...state,
        currentEditingId: action.payload,
      };
    case SYNCHRO_GRAPHDATAMAP:
      return {
        ...state,
        graphDataMap: state.graphDataMap.set(
          state.currentEditingId,
          action.payload
        ),
      };
    default:
      return state;
  }
};