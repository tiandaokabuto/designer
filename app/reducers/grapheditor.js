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
  CHANGE_CHECKEDTREENODE,
  CHANGE_CURRENTPROJECT,
  SYNCHRO_GRAPHDATATOPROCESSTREE,
  CHANGE_CURRENTEDITINGPROCESSID,
  RESET_ALLGRAPHEDITDATA,
} from '../actions/grapheditor';

import { isDirNode, findNodeByKey } from '../containers/common/utils';

const defaultState = {
  graphData: {},
  graphDataMap: new Map(), // 保存针对每个流程图的数据结构
  currentEditingId: undefined, // 当前编辑的是哪个流程块
  checkedGraphBlockId: undefined,
  editorBlockPythonCode: '',
  processTree: [], // 当前项目的自定义流程树结构
  currentEditingProcessId: undefined, // 当前编辑的是项目下的哪个流程
  currentCheckedTreeNode: undefined,
  currentProject: undefined,
};

const objChangeMap = obj => {
  let map = new Map();
  for (let key in obj) {
    map.set(key, obj[key]);
  }
  return map;
};

const mapChangeObj = map => {
  let obj = {};
  for (let [k, v] of map) {
    obj[k] = v;
  }
  return obj;
};
const mapChangeJson = map => JSON.stringify(mapChangeObj(map));
const jsonChangeMap = json => objChangeMap(JSON.parse(json));

const changeEditingProcessId = (state, currentCheckedTreeNode) => {
  // 判断是否为目录结点不做任务操作
  const node = findNodeByKey(state.processTree, currentCheckedTreeNode);
  if (!node || node.type === 'dir') {
    return {};
  } else {
    return {
      currentEditingProcessId: currentCheckedTreeNode,
      graphData: node.data.graphData,
      graphDataMap: node.data.graphDataMap
        ? jsonChangeMap(node.data.graphDataMap)
        : new Map(),
    };
  }
};

const updateProcessTree = state => {
  const { processTree, graphDataMap, graphData } = state;
  const node = findNodeByKey(processTree, state.currentEditingProcessId);
  console.log(processTree, state, 'save');
  if (!node) return processTree;
  node.data = {
    graphDataMap: mapChangeJson(graphDataMap),
    graphData,
  };

  return processTree;
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
    case CHANGE_CHECKEDTREENODE:
      return {
        ...state,
        currentCheckedTreeNode: action.payload,
        // 判断当前点击的是否为流程结点 切换当前编辑的流程结点
        ...changeEditingProcessId(state, action.payload),
      };
    case CHANGE_CURRENTPROJECT:
      return {
        ...state,
        currentProject: action.payload,
      };
    case SYNCHRO_GRAPHDATATOPROCESSTREE:
      return {
        ...state,
        ...updateProcessTree(state),
      };
    case RESET_ALLGRAPHEDITDATA:
      return {
        ...state,
        currentCheckedTreeNode: undefined,
        graphData: {},
        graphDataMap: new Map(),
      };
    default:
      return state;
  }
};
