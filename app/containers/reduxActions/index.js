import {
  CHANGE_GRAPHDATA,
  CHANGE_CURRENTEDITINGBLOCKID,
  SYNCHRO_GRAPHDATAMAP,
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
