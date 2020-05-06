import {
  CHANGE_GRAPHDATA,
  CHANGE_CURRENTEDITINGBLOCKID,
  SYNCHRO_GRAPHDATAMAP,
  SET_GRAPHDATAMAP,
  CHANGE_CHECKEDGRAPHBLOCKID,
  CHANGE_EDITORBLOCKPYTHONCODE,
  CHANGE_PROCESSTREE,
  CHANGE_CHECKEDTREENODE,
  CHANGE_CURRENTPROJECT,
  SYNCHRO_GRAPHDATATOPROCESSTREE,
  RESET_ALLGRAPHEDITDATA,
  RESET_GRAPHERITORALLDATA,
  CHANGE_MODULE_TREE,
  CHANGE_CHECKED_MODULE_TREE_NODE,
  CHANGE_TREE_TAB,
  CHANGE_SAVING_MODULE_DATA,
  CHANGE_MOVING_MODULE_NODE,
  CHANGE_MOVING_MODULE_NODE_DATA,
} from '../../actions/grapheditor';
import {
  SYNCHRO_CODEBLOCK,
  CHANGE_AUTOMICLIST,
  CHANGE_CHECKEDID,
  CHANGE_AIHINTLIST,
  CHANGE_BLOCK_TREE_TAB,
  CHANGE_CLIPBOARDDATA,
  CHANGE_CARDDATA,
} from '../../actions/codeblock';
import {
  UPDATE_EXECUTEOUTPUT,
  UPDATE_CURRENTPAGEPOSITION,
} from '../../actions/temporaryvariable';
import store from '../../store';

const { dispatch } = store || {};

export const changeBlockTreeTab = (tab) => {
  dispatch({
    type: CHANGE_BLOCK_TREE_TAB,
    payload: tab,
  });
};

export const updateCardData = (data) => {
  dispatch({
    type: CHANGE_CARDDATA,
    payload: data,
  });
};

export const updateClipBoardData = (data) => {
  dispatch({
    type: CHANGE_CLIPBOARDDATA,
    payload: data,
  });
};

export const updateAIHintList = (list) => {
  dispatch({
    type: CHANGE_AIHINTLIST,
    payload: list,
  });
};

export const updateCheckedBlockId = (id) => {
  dispatch({
    type: CHANGE_CHECKEDID,
    payload: id,
  });
};

/**
 * 修改当前所处的页面位置
 */
export const updateCurrentPagePosition = (position) => {
  dispatch({
    type: UPDATE_CURRENTPAGEPOSITION,
    payload: position,
  });
};

export const updateExecuteOutput = (data) => {
  dispatch({
    type: UPDATE_EXECUTEOUTPUT,
    payload: data,
  });
};

export const clearGrapheditorData = () => {
  dispatch({
    type: RESET_GRAPHERITORALLDATA,
  });
};

export const updateAutomicList = (treeData) => {
  dispatch({
    type: CHANGE_AUTOMICLIST,
    payload: treeData,
  });
};

export const updateGraphData = (graphData = []) => {
  dispatch({
    type: CHANGE_GRAPHDATA,
    payload: graphData,
  });
};

/**
 * 更新当前正在编辑的流程块的id
 */
export const updateCurrentEditingProcessBlock = (id) => {
  dispatch({
    type: CHANGE_CURRENTEDITINGBLOCKID,
    payload: id,
  });
};

export const synchroGraphDataToProcessTree = () => {
  dispatch({
    type: SYNCHRO_GRAPHDATATOPROCESSTREE,
  });
};

/**
 * 代码同步功能 --- 同步已经编辑后的流程块的代码到 graphDataMap
 */
export const synchroGraphDataMap = (cards, pythonCode) => {
  // FIXME.... 迭代演示需要 暂时在这里生成每个流程块的参数配置
  dispatch({
    type: SYNCHRO_GRAPHDATAMAP,
    payload: {
      cards,
      pythonCode,
    },
  });
  setTimeout(() => {
    synchroGraphDataToProcessTree();
  }, 333);
};

/**
 * 代码同步功能 --- 同步graphDataMap中的数据到即将要编辑的 codeblock 中
 */
export const synchroCodeBlock = (mapData = {}) => {
  dispatch({
    type: SYNCHRO_CODEBLOCK,
    payload: mapData,
  });
};

/**
 * 流程图中的流程块结点的初始参数设置
 */
export const setGraphDataMap = (key, value = {}) => {
  dispatch({
    type: SET_GRAPHDATAMAP,
    payload: {
      key,
      value,
    },
  });
  setTimeout(() => {
    synchroGraphDataToProcessTree();
  }, 333);
};

/**
 * 修改当前正处于点击状态的流程图的流程块的id
 */
export const changeCheckedGraphBlockId = (id) => {
  dispatch({
    type: CHANGE_CHECKEDGRAPHBLOCKID,
    payload: id,
  });
};

/**
 * 更新当前流程图的转译后的python代码
 */

export const updateEditorBlockPythonCode = (code) => {
  dispatch({
    type: CHANGE_EDITORBLOCKPYTHONCODE,
    payload: code,
  });
};

/**
 * 更新左侧项目目录树
 * @param {*} processTree
 */
export const changeProcessTree = (processTree = []) => {
  dispatch({
    type: CHANGE_PROCESSTREE,
    payload: processTree,
  });
};

/**
 * 修改当前选中的流程树结点
 * @param {*} checkedTreeNode
 */
export const changeCheckedTreeNode = (checkedTreeNode) => {
  dispatch({
    type: CHANGE_CHECKEDTREENODE,
    payload: checkedTreeNode,
  });
};

/**
 * 更新复用流程块的树
 * @param {*} moduleTree
 */
export const changeModuleTree = (moduleTree = []) => {
  dispatch({
    type: CHANGE_MODULE_TREE,
    payload: moduleTree,
  });
};

/**
 * 当前选中的复用流程块
 * @param {*} checkedModuleTreeNode
 */
export const changeCheckedModuleTreeNode = (checkedModuleTreeNode) => {
  dispatch({
    type: CHANGE_CHECKED_MODULE_TREE_NODE,
    payload: checkedModuleTreeNode,
  });
};

export const changeTreeTab = (tab) => {
  dispatch({
    type: CHANGE_TREE_TAB,
    payload: tab,
  });
};

export const changeSavingModuleData = (data) => {
  dispatch({
    type: CHANGE_SAVING_MODULE_DATA,
    payload: data,
  });
};

export const changeMovingModuleNode = (node) => {
  dispatch({
    type: CHANGE_MOVING_MODULE_NODE,
    payload: node,
  });
};

export const changeMovingModuleNodeData = (data) => {
  dispatch({
    type: CHANGE_MOVING_MODULE_NODE_DATA,
    payload: data,
  });
};

export const changeCurrentProject = (projectName) => {
  dispatch({
    type: CHANGE_CURRENTPROJECT,
    payload: projectName,
  });
};

/**
 * 重置流程图模块的相关数据
 */
export const resetGraphEditData = () => {
  dispatch({
    type: RESET_ALLGRAPHEDITDATA,
  });
};
