/**
 * 代码块流程数据
 */
import cloneDeep from 'lodash/cloneDeep';

import {
  CHANGE_CARDDATA,
  CHANGE_CHECKEDID,
  CHANGE_PYTHONCODE,
  SYNCHRO_CODEBLOCK,
  CHANGE_AUTOMICLIST,
  CHANGE_AIHINTLIST,
  CHANGE_BLOCK_TREE_TAB,
  CHANGE_CLIPBOARDDATA,
  CHANGE_PENDING_QUEUE,
  UNDO_CARDSDATA,
  CHANGE_FORCEUPDATE_TAG,
  RESET_PENDING_QUEUE,
  REDO_CARDSDATA,
} from '../actions/codeblock';

import { synchroGraphDataMap } from '../containers/reduxActions';

const MAX_QUEUE_LENGTH = 20;

const defaultState = {
  cards: [],
  checkedId: [],
  pythonCode: '',
  automicList: [],
  aiHintList: {},
  blockTreeTab: 'atomic', // actomic module
  clipboardData: {},
  cardsPendingQueue: [],
  pendingCursor: -1,
  forceUpdateTag: false,
};

let locked = false;

export default (state = defaultState, action) => {
  let { pendingCursor, cardsPendingQueue } = state;
  switch (action.type) {
    case CHANGE_FORCEUPDATE_TAG:
      return {
        ...state,
        forceUpdateTag: action.payload,
      };
    case RESET_PENDING_QUEUE:
      return {
        ...state,
        pendingCursor: -1,
        cardsPendingQueue: [],
      };
    case CHANGE_PENDING_QUEUE:
      if (locked) {
        locked = false;
        return state;
      }

      const diff = cardsPendingQueue.length - MAX_QUEUE_LENGTH;
      if (diff >= 0) {
        cardsPendingQueue.shift();
        pendingCursor--;
      }
      if (pendingCursor < cardsPendingQueue.length - 1) {
        cardsPendingQueue = cardsPendingQueue.slice(0, pendingCursor + 1);
      }
      return {
        ...state,
        pendingCursor: pendingCursor + 1,
        cardsPendingQueue: cardsPendingQueue.concat(action.payload),
      };
    case UNDO_CARDSDATA:
      if (pendingCursor > 0) {
        locked = true;
        return {
          ...state,
          cards: cloneDeep(cardsPendingQueue[pendingCursor - 1]),
          pendingCursor: pendingCursor - 1,
        };
      }
      return state;
    case REDO_CARDSDATA:
      if (pendingCursor < cardsPendingQueue.length - 1) {
        locked = true;
        return {
          ...state,
          cards: cloneDeep(cardsPendingQueue[pendingCursor + 1]),
          pendingCursor: pendingCursor + 1,
        };
      }
      return state;
    case CHANGE_BLOCK_TREE_TAB:
      return {
        ...state,
        blockTreeTab: action.payload,
      };
    case CHANGE_CLIPBOARDDATA:
      return {
        ...state,
        clipboardData: {
          ...state.clipboardData,
          ...action.payload,
        },
      };
    case CHANGE_AIHINTLIST:
      return {
        ...state,
        aiHintList: action.payload,
      };
    case CHANGE_AUTOMICLIST:
      return {
        ...state,
        automicList: action.payload,
      };
    case CHANGE_CARDDATA:
      return {
        ...state,
        cards: action.payload,
      };
    case CHANGE_CHECKEDID:
      return {
        ...state,
        checkedId: action.payload,
      };
    case CHANGE_PYTHONCODE:
      // 同步更新最新的流程块的结构到 graphDataMap 注意要放在事件循环的下次来做 否则会报错
      setTimeout(() => {
        synchroGraphDataMap(state.cards, action.payload);
      }, 0);
      return {
        ...state,
        pythonCode: action.payload,
      };
    case SYNCHRO_CODEBLOCK:
      return {
        ...state,
        pythonCode: action.payload.pythonCode || '',
        cards: action.payload.cards || [],
      };
    default:
      return state;
  }
};
