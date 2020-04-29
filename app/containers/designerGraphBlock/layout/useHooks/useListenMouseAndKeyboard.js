import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';

import {
  updateCheckedBlockId,
  updateClipBoardData,
  updateCardData,
} from '../../../reduxActions';
import { insertAfter } from '../shared/utils';
import { PREFIX_ID } from '../statementTypes';
const remote = require('electron').remote;
const { clipboard } = require('electron');
const electronLocalshortcut = require('electron-localshortcut');

const KEYCODEMAP = {
  shift: 16,
  ctrl: 17,
};

export const keyDownMap = {
  isCtrlDown: false,
  isShiftDown: false,
};

const getUniqueId = arr => {
  let newId = uniqueId(PREFIX_ID);
  while (arr.includes(newId)) {
    newId = uniqueId(PREFIX_ID);
  }
  return newId;
};

const traverseAllCards = (cards, callback) => {
  for (const child of cards) {
    if (child.children) {
      callback && callback(child);
      traverseAllCards(child.children, callback);
    } else if (child.ifChildren) {
      callback && callback(child);
      traverseAllCards(child.ifChildren, callback);
      traverseAllCards(child.elseChildren, callback);
    } else {
      callback && callback(child);
    }
  }
};

const extractTraverse = async (cards, callback) => {
  for (const child of cards) {
    if (child.children) {
      const isExact = await callback(child);
      !isExact && extractTraverse(child.children, callback);
    } else if (child.ifChildren) {
      const isExact = await callback(child);
      !isExact && extractTraverse(child.ifChildren, callback);
      !isExact && extractTraverse(child.elseChildren, callback);
    } else {
      callback && callback(child);
    }
  }
};

const extractCheckedData = (cards, checkedId) => {
  const result = [];
  extractTraverse(cards, node => {
    if (checkedId.includes(node.id)) {
      result.push(cloneDeep(node));
      return true;
    }
    return false;
  });
  return result;
};

const getOrderedNodeList = cards => {
  const currentIdList = [];
  traverseAllCards(cards, node => {
    currentIdList.push(node.id);
  });
  return currentIdList;
};

const attachedNodeId = (cards, append) => {
  const currentIdList = getOrderedNodeList(cards);

  traverseAllCards(append, node => {
    node.id = getUniqueId(currentIdList);
    currentIdList.push(node.id);
  });
};

export default () => {
  const checkedId = useSelector(state => state.blockcode.checkedId);
  const cards = useSelector(state => state.blockcode.cards);
  const clipboardData = useSelector(state => state.blockcode.clipboardData);

  const setKeyState = useCallback((key, bool) => {
    if (key === 'ctrl') {
      keyDownMap.isCtrlDown = bool;
    } else if (key === 'shift') {
      keyDownMap.isShiftDown = bool;
    }
  }, []);
  const isCtrlKeyDown = () => {
    return keyDownMap.isCtrlDown;
  };
  const isShiftKeyDown = () => {
    return keyDownMap.isShiftDown;
  };
  useEffect(() => {
    const handleKeyDown = e => {
      switch (e.keyCode) {
        case KEYCODEMAP.ctrl:
          setKeyState('ctrl', true);
          break;
        case KEYCODEMAP.shift:
          setKeyState('shift', true);
          break;
        default:
        // do nothing
      }
    };
    const handleKeyUp = e => {
      switch (e.keyCode) {
        case KEYCODEMAP.ctrl:
          setKeyState('ctrl', false);
          break;
        case KEYCODEMAP.shift:
          setKeyState('shift', false);
          break;
        default:
        // do nothing
      }
    };
    const handleMouseDown = e => {
      const id = e.target.dataset.id;
      let newCheckedId = checkedId.concat();
      if (!id) return;
      if (isCtrlKeyDown()) {
        if (newCheckedId.includes(id)) {
          newCheckedId = newCheckedId.filter(g => g !== id);
          updateCheckedBlockId(newCheckedId);
        } else {
          newCheckedId.unshift(id);
          updateCheckedBlockId(newCheckedId);
        }
        return;
      }
      if (isShiftKeyDown()) {
        console.log('shift + 鼠标左键');
        // empty
        if (!newCheckedId.length) {
          newCheckedId.push(id);
        } else {
          // firstIndex -> current
          const startNode = newCheckedId.shift();
          const orderedIdList = getOrderedNodeList(cards);
          let startIndex = orderedIdList.findIndex(item => item === startNode);
          let lastIndex = orderedIdList.findIndex(item => item === id);
          let isReverse = false;
          if (startIndex > lastIndex) {
            isReverse = true;
            [startIndex, lastIndex] = [lastIndex, startIndex];
          }
          newCheckedId = orderedIdList.slice(startIndex, lastIndex + 1);
          console.log(newCheckedId);
          if (isReverse) {
            newCheckedId.reverse();
          }
        }
        updateCheckedBlockId(newCheckedId);
        return;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setKeyState, checkedId, cards]);

  useEffect(() => {
    const win = remote.getCurrentWindow();
    if (!win || !win.webContents) return;
    electronLocalshortcut.register(win, 'Ctrl+C', () => {
      setTimeout(() => {
        const selected = window.getSelection().toString();
        if (selected) {
          updateClipBoardData({
            dep: [],
            content: undefined,
          });
          return;
        }
        if (checkedId.length) {
          // 生成待保存的数据结构
          updateClipBoardData({
            dep: checkedId,
            content: extractCheckedData(cards, checkedId),
          });
          clipboard.writeText('copy-cardData', 'selection');
          message.success('复制成功');
        }
      }, 0);
    });
    electronLocalshortcut.register(win, 'Ctrl+V', () => {
      if (!clipboardData.content) {
        return;
      }
      if (clipboard.readText('selection') !== 'copy-cardData') return;
      if (checkedId.length === 1 || !cards.length) {
        // 生成待保存的数据结构
        const append = cloneDeep(clipboardData.content || []);
        attachedNodeId(cards, append);
        const result = insertAfter(cards, checkedId[0], append);
        if (result) {
          updateCardData([...cards]);
          updateCheckedBlockId(getOrderedNodeList(append));
          message.success('粘贴成功');
        } else {
          message.info('请选择粘贴位置');
        }
      } else {
        message.info('当前不能执行粘贴操作');
      }
    });

    return () => {
      electronLocalshortcut.unregisterAll(win);
    };
  }, [checkedId, cards, clipboardData]);
};
