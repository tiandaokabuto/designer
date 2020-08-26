import {
  CHANGE_DEBUG_INFOS,
  DEBUG_RESET_ALL_INFO,
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_BLOCK_ALL_RUN,
  //
  DEBUG_RUN_BLOCK_CHANGE_STATE_RUNNING,
  DEBUG_RUN_BLOCK_CHANGE_STATE_PAUSED,
  DEBUG_RUN_BLOCK_CHANGE_STATE_END,
  //
  DEBUG_RUN_CARDS_CHANGE_STATE_RUNNING,
  DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED,
  DEBUG_RUN_CARDS_CHANGE_STATE_END,
  //
  DEBUG_SET_BTN_CAN_BE_PASUE,
  DEBUG_SET_BTN_CAN_BE_CONTINUE,
  //
  DEBUG_ONE_STEP_RUN_BLOCK,
  DEBUG_ONE_STEP_RUN_CARDS,
  DEBUG_ONE_STEP_RUN_STARTED,
  DEBUG_ONE_STEP_FINISHED_BLOCK,
  DEBUG_ONE_STEP_FINISHED_CARDS,
  DEBUG_ONE_STEP_FINISHED_STARTED,
  //
  DEBUG_PUT_SOURCECODE,
  DEBUG_SOURCECODE_INSERT,
} from '../constants/actions/debugInfos';

import cloneDeep from 'lodash/cloneDeep';

import { isDirNode, findNodeByKey } from '_utils/utils';

const defaultState = {
  switch: false, // DEBUG是否打开
  running: false, // 是否顺序运行
  oneRunning: false, // 是否在单步调试运行中
  runningState: 'started', // 当前的运行状态
  pause: false, // 是否处于暂停状态
  dataStore: [], // 数据仓库
  stepLog: {},
  updater: 0,
};

const copyDefault = cloneDeep(defaultState);

export default (state = defaultState, action) => {
  switch (action.type) {
    // 通用，改变调试信息
    case CHANGE_DEBUG_INFOS:
      return {
        ...state,
        ...action.payload,
      };
    // 重置信息
    case DEBUG_RESET_ALL_INFO:
      return {
        ...copyDefault,
      };
    // 打开debug
    case DEBUG_OPEN_DEBUGSERVER:
      return {
        ...state,
        switch: true,
      };
    // 关闭debug
    case DEBUG_CLOSE_DEBUGSERVER:
      return {
        ...state,
        switch: false,
      };
    // 按序调试-流程块 改状态
    // -> 运行中
    // -> 暂停中
    // -> 已跑完（复位）
    case DEBUG_RUN_BLOCK_CHANGE_STATE_RUNNING:
      return {
        ...state,
        running: true,
        runningState: 'blockAll_running',
      };
    case DEBUG_RUN_BLOCK_CHANGE_STATE_PAUSED:
      return {
        ...state,
        runningState: 'blockAll_pause',
      };
    case DEBUG_RUN_BLOCK_CHANGE_STATE_END:
      return {
        ...state,
        running: false,
        pasue: false,
        runningState: 'started',
      };
    // 按序调试-原子能力 改状态
    // -> 运行中
    // -> 暂停中
    // -> 已跑完（复位）
    case DEBUG_RUN_CARDS_CHANGE_STATE_RUNNING:
      return {
        ...state,
        running: true,
        runningState: 'cardsAll_running',
      };
    case DEBUG_RUN_CARDS_CHANGE_STATE_PAUSED:
      return {
        ...state,
        runningState: 'cardsAll_pause',
      };
    case DEBUG_RUN_CARDS_CHANGE_STATE_END:
      return {
        ...state,
        running: false,
        pasue: false,
        runningState: 'started',
      };
    // 暂停继续
    case DEBUG_SET_BTN_CAN_BE_PASUE:
      return {
        ...state,
        running: true,
        pasue: false,
      };
    case DEBUG_SET_BTN_CAN_BE_CONTINUE:
      return {
        ...state,
        running: true,
        pasue: true,
      };
    // 单步运行
    case DEBUG_ONE_STEP_RUN_BLOCK:
      return {
        ...state,
        oneRunning: true,
        runningState: 'blockAll_one',
      };
    case DEBUG_ONE_STEP_RUN_CARDS:
      return {
        ...state,
        oneRunning: true,
        runningState: 'cardsAll_one',
      };
    case DEBUG_ONE_STEP_RUN_STARTED:
      return {
        ...state,
        oneRunning: true,
        runningState: 'started_one',
      };
    // 单步结束，设置回原样
    case DEBUG_ONE_STEP_FINISHED_BLOCK:
      return {
        ...state,
        oneRunning: false,
        runningState: 'blockAll_running',
      };
    case DEBUG_ONE_STEP_FINISHED_CARDS:
      return {
        ...state,
        oneRunning: false,
        runningState: 'cardsAll_running',
      };
    case DEBUG_ONE_STEP_FINISHED_STARTED:
      return {
        ...state,
        oneRunning: false,
        runningState: 'started',
      };
    // 放入代码
    case DEBUG_PUT_SOURCECODE:
      console.log(`action.payload`, action.tempCenter);
      return {
        ...state,
        dataStore: action.payload,
      };
    case DEBUG_SOURCECODE_INSERT:
      const { nowIndex, nowIndexCards, nowLevel } = action.payload.index;
      const log = action.payload.log;
      if (nowLevel === 'block') {
        let temp = state.dataStore;

        if (nowIndex - 1 === -1) {
          temp[Object.keys(temp).length - 1].hasLog = log;
        }else{
          temp[nowIndex - 1].hasLog = log;
        }

        return {
          ...state,
          dataStore: temp,
          updater: state.updater + 1,
        };
      } else if (nowLevel === 'cards') {
        let temp = state.dataStore;
        if (!temp.stepLog) {
          temp.stepLog = {};
        }

        const stepLog = state.stepLog;

        if (nowIndexCards - 1 === -1) {
          // console.clear();
          console.log(Object.keys(temp.stepLog).length)
          temp.stepLog[Object.keys(temp.stepLog).length - 1] = log;
        }else{
          temp.stepLog[nowIndexCards - 1] = log;
        }



        stepLog[nowIndexCards - 1] = log;

        return {
          ...state,
          dataStore: temp,
          stepLog: stepLog,
          updater: state.updater + 1,
        };
      }
    default:
      return state;
  }
};
