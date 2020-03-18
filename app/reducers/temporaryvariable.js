import { UPDATE_EXECUTEOUTPUT } from '../actions/temporaryvariable';

const defaultState = {
  executeOutput: '',
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_EXECUTEOUTPUT:
      return {
        ...state,
        executeOutput: action.payload,
      };
    default:
      return state;
  }
};
