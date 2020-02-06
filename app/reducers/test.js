import { CHANGE_SOURCECODE } from '../actions/test';

const defaultState = {
  pythonCode: '',
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case CHANGE_SOURCECODE:
      return {
        ...state,
        pythonCode: action.payload,
      };
    default:
      return state;
  }
};
