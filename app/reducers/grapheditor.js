import {
  CHANGE_GRAPHDATA,
  SET_GRAPHDATAMAP,
  DELETE_GRAPHDATAMAP,
  CLEAR_GRAPHDATAMAP,
  CHANGE_CURRENTEDITINGBLOCKID,
  SYNCHRO_GRAPHDATAMAP,
  CHANGE_CHECKEDGRAPHBLOCKID,
  CHANGE_EDITORBLOCKPYTHONCODE,
  CHANGE_PROCESSTREE,
} from '../actions/grapheditor';

const defaultState = {
  graphData: {},
  graphDataMap: new Map(), // 保存针对每个流程图的数据结构
  currentEditingId: undefined,
  checkedGraphBlockId: undefined,
  editorBlockPythonCode: '',
  processTree: [],
};

export default (state = defaultState, action) => {
  let mapData = undefined;
  switch (action.type) {
    case CHANGE_GRAPHDATA:
      return {
        ...state,
        graphData: action.payload,
      };
    case SET_GRAPHDATAMAP:
      mapData = state.graphDataMap.get(action.payload.key) || {};
      return {
        ...state,
        graphDataMap: state.graphDataMap.set(action.payload.key, {
          ...mapData,
          ...action.payload.value,
        }),
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
      mapData = state.graphDataMap.get(state.currentEditingId) || {};
      return {
        ...state,
        graphDataMap: state.graphDataMap.set(state.currentEditingId, {
          ...mapData,
          ...action.payload,
        }),
      };
    case CHANGE_CHECKEDGRAPHBLOCKID:
      return {
        ...state,
        checkedGraphBlockId: action.payload,
      };
    case CHANGE_EDITORBLOCKPYTHONCODE:
      return {
        ...state,
        editorBlockPythonCode: action.payload,
      };
    case CHANGE_PROCESSTREE:
      return {
        ...state,
        processTree: action.payload,
      };
    default:
      return state;
  }
};
