import { CHANGE_GRAPHDATA } from '../../actions/grapheditor';
import store from '../../store';

const { dispatch } = store;

export const updateGraphData = (graphData = []) => {
  dispatch({
    type: CHANGE_GRAPHDATA,
    payload: graphData,
  });
};
