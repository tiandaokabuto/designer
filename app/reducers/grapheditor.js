import { CHANGE_GRAPHDATA } from '../actions/grapheditor';

const defaultState = {
  graphData: {},
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case CHANGE_GRAPHDATA:
      return {
        ...state,
        graphData: action.payload,
      };
    default:
      return state;
  }
};
