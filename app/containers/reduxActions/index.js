import {
  CHANGE_GRAPHDATA,
  CHANGE_CURRENTEDITINGBLOCKID,
  SYNCHRO_GRAPHDATAMAP,
} from '../../actions/grapheditor';
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
 * 代码同步功能
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
