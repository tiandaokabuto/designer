import {
  CHANGE_GRAPHDATA,
  CHANGE_CURRENTEDITINGBLOCKID,
  SYNCHRO_GRAPHDATAMAP,
  SET_GRAPHDATAMAP,
  CHANGE_CHECKEDGRAPHBLOCKID,
  CHANGE_EDITORBLOCKPYTHONCODE,
  CHANGE_PROCESSTREE,
} from '../../actions/grapheditor';
import { SYNCHRO_CODEBLOCK } from '../../actions/codeblock';
import store from '../../store';

const { dispatch } = store;

export const updateGraphData = (graphData = []) => {
  dispatch({
    type: CHANGE_GRAPHDATA,
    payload: graphData,
  });
};

/**
 * 更新当前正在编辑的流程块的id
 */
export const updateCurrentEditingProcessBlock = id => {
  dispatch({
    type: CHANGE_CURRENTEDITINGBLOCKID,
    payload: id,
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
};

/**
 * 修改当前正处于点击状态的流程图的流程块的id
 */
export const changeCheckedGraphBlockId = id => {
  dispatch({
    type: CHANGE_CHECKEDGRAPHBLOCKID,
    payload: id,
  });
};

/**
 * 更新当前流程图的转译后的python代码
 */

export const updateEditorBlockPythonCode = code => {
  dispatch({
    type: CHANGE_EDITORBLOCKPYTHONCODE,
    payload: code,
  });
};

export const changeProcessTree = (processTree = []) => {
  dispatch({
    type: CHANGE_PROCESSTREE,
    payload: processTree,
  });
};
