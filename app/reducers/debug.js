import {
  CHANGE_DEBUG_INFOS,
  DEBUG_RESET_ALL_INFO,
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_BLOCK_ALL_RUN,
} from '../constants/actions/debugInfos';

import cloneDeep from 'lodash/cloneDeep';

import { isDirNode, findNodeByKey } from '_utils/utils';

const defaultState = {
  switch: false, // DEBUG是否打开
  running: false, // 是否顺序运行
  oneRunning: false, // 是否在单步调试运行中
  runningState: '', // 当前的运行状态
  pause: false, // 是否处于暂停状态
  dataStore: {
    pythonLine: [], // 代码
    variable: [], // 变量
  }, // 数据仓库
};

const copyDefault = cloneDeep(defaultState);

export default (state = defaultState, action) => {
  switch (action.type) {
    case CHANGE_DEBUG_INFOS:
      return {
        ...state,
        ...action.payload,
      };
    case DEBUG_RESET_ALL_INFO:
      return {
        ...copyDefault,
      };
    case DEBUG_OPEN_DEBUGSERVER:
      return {
        ...state,
        switch: true,
      };
    case DEBUG_CLOSE_DEBUGSERVER:
      return {
        ...state,
        switch: false,
      };

    case DEBUG_RUN_BLOCK_ALL_RUN:
      return {
        ...state,
        running: true,
      };

    default:
      return state;
  }
};
