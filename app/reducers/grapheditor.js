import {
  CHANGE_GRAPHDATA,
  SET_GRAPHDATAMAP,
  DELETE_GRAPHDATAMAP,
  CLEAR_GRAPHDATAMAP,
  SYNCHRO_GRAPHDATAMAP,
  CHANGE_CHECKEDGRAPHBLOCKID,
  CHANGE_EDITORBLOCKPYTHONCODE,
  CHANGE_PROCESSTREE,
  CHANGE_CHECKEDTREENODE,
  CHANGE_CURRENTPROJECT,
  SYNCHRO_GRAPHDATATOPROCESSTREE,
  RESET_ALLGRAPHEDITDATA,
  RESET_GRAPHERITORALLDATA,
  CHANGE_CHECKED_MODULE_TREE_NODE,
  CHANGE_MODULE_TREE,
  CHANGE_TREE_TAB,
  CHANGE_SAVING_MODULE_DATA,
  CHANGE_MOVING_MODULE_NODE,
  CHANGE_MOVING_MODULE_NODE_DATA,
  CHANGE_MXGRAPH_DATA,
} from '../actions/grapheditor';

import { isDirNode, findNodeByKey } from '../containers/common/utils';

const defaultState = {
  mxgraphData: {},
  graphData: {},
  graphDataMap: new Map(), // 保存针对每个流程图的数据结构
  checkedGraphBlockId: undefined,
  editorBlockPythonCode: '',
  treeTab: 'process',
  processTree: [], // 当前项目的自定义流程树结构
  moduleTree: [], // 当前项目的复用流程块树结构
  currentCheckedModuleTreeNode: undefined, // 当前选中的复用块
  currentCheckedTreeNode: undefined,
  currentProject: undefined,
  savingModuleData: undefined,
  movingModuleNode: undefined,
  movingModuleNodeData: undefined,
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

const updateGraphData = (state, currentCheckedTreeNode) => {
  // 判断是否为目录结点不做任务操作
  const node = findNodeByKey(state.processTree, currentCheckedTreeNode);
  if (!node || node.type === 'dir') {
    return {};
  } else {
    return {
      graphData: node.data.graphData,
      graphDataMap: node.data.graphDataMap
        ? jsonChangeMap(node.data.graphDataMap)
        : new Map(),
    };
  }
};

const updateProcessTree = state => {
  const { processTree, graphDataMap, graphData } = state;
  const node = findNodeByKey(processTree, state.currentCheckedTreeNode);
  if (!node) return processTree;
  node.data = {
    graphDataMap: mapChangeJson(graphDataMap),
    graphData,
  };

  return {};
};

export default (state = defaultState, action) => {
  let mapData = undefined;
  switch (action.type) {
    case RESET_GRAPHERITORALLDATA:
      return {
        ...state,
        graphData: {},
        graphDataMap: new Map(), // 保存针对每个流程图的数据结构
        checkedGraphBlockId: undefined,
        editorBlockPythonCode: '',
        processTree: [], // 当前项目的自定义流程树结构
        currentCheckedModuleTreeNode: undefined, // 当前选中的复用块
        currentCheckedTreeNode: undefined,
      };
    case CHANGE_MXGRAPH_DATA:
      return {
        ...state,
        mxgraphData: action.payload,
      };
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
      // 再读取文件时，再把这个map中的undefined清空掉
      // console.clear();
      console.log(action.payload.key);
      return {
        ...state,
        graphDataMap: state.graphDataMap.set(action.payload.key, undefined),
      };
    // return {
    //   ...state,
    //   graphDataMap:
    //     //state.graphDataMap.set(action.payload.key, undefined),
    //     state.graphDataMap.delete(action.payload.key),
    // };
    case CLEAR_GRAPHDATAMAP:
      return {
        ...state,
        graphDataMap: new Map(),
      };
    case SYNCHRO_GRAPHDATAMAP:
      mapData = state.graphDataMap.get(state.checkedGraphBlockId) || {};
      return {
        ...state,
        graphDataMap: state.graphDataMap.set(state.checkedGraphBlockId, {
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
    case CHANGE_MODULE_TREE:
      return {
        ...state,
        moduleTree: action.payload,
      };
    case CHANGE_CHECKED_MODULE_TREE_NODE:
      return {
        ...state,
        currentCheckedModuleTreeNode: action.payload,
      };
    case CHANGE_TREE_TAB:
      return {
        ...state,
        treeTab: action.payload,
      };
    case CHANGE_SAVING_MODULE_DATA:
      return {
        ...state,
        savingModuleData: action.payload,
      };
    case CHANGE_CHECKEDTREENODE:
      return {
        ...state,
        currentCheckedTreeNode: action.payload,
        // 判断当前点击的是否为流程结点 切换当前编辑的流程结点
        ...updateGraphData(state, action.payload),
      };
    case CHANGE_CURRENTPROJECT:
      return {
        ...state,
        currentProject: action.payload,
      };
    case CHANGE_MOVING_MODULE_NODE:
      return {
        ...state,
        movingModuleNode: action.payload,
      };
    case CHANGE_MOVING_MODULE_NODE_DATA:
      return {
        ...state,
        movingModuleNodeData: action.payload,
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
