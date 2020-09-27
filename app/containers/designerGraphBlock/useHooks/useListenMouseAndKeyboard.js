import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';
import event from '@/containers/eventCenter';
import {
  CUT_COMMAND,
  COPY_COMMAND,
  PASTE_COMMAND,
  DELETE_COMMAND,
} from '@/containers/eventCenter/eventTags';
import {
  updateCheckedBlockId,
  updateClipBoardData,
  updateCardData,
} from '../../reduxActions';
import { insertAfter } from '../../../utils/GraphBlockUtils/utils';
import { PREFIX_ID } from '../constants/statementTypes';
import {
  UNDO_CARDSDATA,
  REDO_CARDSDATA,
  CHANGE_FORCEUPDATE_TAG,
} from '../../../constants/actions/codeblock';
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
    } else if (child.tryChildren) {
      callback && callback(child);
      traverseAllCards(child.tryChildren, callback);
      traverseAllCards(child.catchChildren, callback);
      traverseAllCards(child.finallyChildren, callback);
    } else {
      callback && callback(child);
    }
  }
};

const extractTraverse = async (cards, callback, parent = cards) => {
  for (const child of cards) {
    if (child.children) {
      const isExact = await callback(child, parent);
      !isExact && extractTraverse(child.children, callback, child.children);
    } else if (child.ifChildren) {
      const isExact = await callback(child, parent);
      !isExact && extractTraverse(child.ifChildren, callback, child.ifChildren);
      !isExact &&
        extractTraverse(child.elseChildren, callback, child.elseChildren);
    } else if (child.tryChildren) {
      const isExact = await callback(child, parent);
      !isExact &&
        extractTraverse(child.tryChildren, callback, child.tryChildren);
      !isExact &&
        extractTraverse(child.catchChildren, callback, child.catchChildren);
      !isExact &&
        extractTraverse(child.finallyChildren, callback, child.finallyChildren);
    } else {
      callback && callback(child, parent);
    }
  }
};

const deleteTraverse = (cards, callback, parent = cards) => {
  for (const child of cards) {
    if (child.children) {
      callback(child, parent);
      deleteTraverse(child.children, callback, child.children);
    } else if (child.ifChildren) {
      callback(child, parent);
      deleteTraverse(child.ifChildren, callback, child.ifChildren);
      deleteTraverse(child.elseChildren, callback, child.elseChildren);
    } else if (child.tryChildren) {
      callback(child, parent);
      deleteTraverse(child.tryChildren, callback, child.tryChildren);
      deleteTraverse(child.catchChildren, callback, child.catchChildren);
      deleteTraverse(child.finallyChildren, callback, child.finallyChildren);
    } else {
      callback(child, parent);
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

const extractDelCheckedData = (cards, checkedId) => {
  const result = [];
  deleteTraverse(cards, node => {
    if (checkedId.includes(node.id)) {
      result.push(cloneDeep(node));
      return true;
    }
    return false;
  });
  return result;
};

const deleteCheckedNode = (cards, checkedId) => {
  // 标记 清除
  const markList = [];
  deleteTraverse(cards, (node, parent) => {
    if (checkedId.includes(node.id)) {
      markList.push({
        parent,
        id: node.id,
      });
    }
  });
  markList.forEach(({ parent, id }) => {
    const index = parent.findIndex(item => item.id === id);
    parent.splice(index, 1);
  });
  updateCardData([...cards]);
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
  const dispatch = useDispatch();
  const forceUpdateTag = useSelector(state => state.blockcode.forceUpdateTag);
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
  const handleCut = () => {
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
        content: extractDelCheckedData(cards, checkedId),
      });
      clipboard.writeText('copy-cardData', 'selection');
      // 删除选中的元素
      deleteCheckedNode(cards, checkedId);
      message.success('剪切成功');
    }
  };
  // 复制操作
  const handleCopy = () => {
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
  };
  // 粘贴操作
  const handlePaste = () => {
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
      message.info('多选粘贴时，请选择需要粘贴位置上方的单个原子能力');
    }
  };
  const handleDelete = () => {
    const selected = window.getSelection().toString();
    if (selected) {
      updateClipBoardData({
        dep: [],
        content: undefined,
      });
      return;
    }
    if (checkedId.length) {
      deleteCheckedNode(cards, checkedId);
      message.success('删除成功');
    }
  };

  // 撤销操作
  const handleRevoke = () => {
    console.log('撤销指令');
    dispatch({
      type: CHANGE_FORCEUPDATE_TAG,
      payload: !forceUpdateTag,
    });
    dispatch({
      type: UNDO_CARDSDATA,
    });
  };
  // 恢复操作
  const handleRecovery = () => {
    console.log('恢复指令');
    dispatch({
      type: CHANGE_FORCEUPDATE_TAG,
      payload: !forceUpdateTag,
    });
    dispatch({
      type: REDO_CARDSDATA,
    });
  };
  useEffect(() => {
    const handleKeyDown = e => {
      setKeyState('ctrl', e.ctrlKey);
      setKeyState('shift', e.shiftKey);
    };
    const handleKeyUp = e => {
      setKeyState('ctrl', e.ctrlKey);
      setKeyState('shift', e.shiftKey);
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
    event.addListener(CUT_COMMAND, handleCut);
    event.addListener(COPY_COMMAND, handleCopy);
    event.addListener(PASTE_COMMAND, handlePaste);
    event.addListener(DELETE_COMMAND, handleDelete);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      event.removeListener(CUT_COMMAND, handleCut);
      event.removeListener(COPY_COMMAND, handleCopy);
      event.removeListener(PASTE_COMMAND, handlePaste);
      event.removeListener(DELETE_COMMAND, handleDelete);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setKeyState, checkedId, cards]);

  useEffect(() => {
    const win = remote.getCurrentWindow();
    if (!win || !win.webContents) return;
    electronLocalshortcut.register(win, 'Ctrl+C', () => {
      handleCopy();
    });
    electronLocalshortcut.register(win, 'Ctrl+V', () => {
      handlePaste();
    });
    console.log(electronLocalshortcut);
    // 支持批量剪切的操作
    // 注释原因：在普通的input框内剪切后selected为空字符串，不会被return，触发原子能力的剪切
    /* electronLocalshortcut.register(win, 'Ctrl+X', () => {
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
            content: extractDelCheckedData(cards, checkedId),
          });
          clipboard.writeText('copy-cardData', 'selection');
          // 删除选中的元素
          deleteCheckedNode(cards, checkedId);
          message.success('剪切成功');
        }
      }, 0);
    }); */

    // 支持删除,批量剪切
    const handleKeyDown = e => {
      if (e.keyCode === 46) {
        handleDelete();
      } else if (e.ctrlKey && e.keyCode === 88) {
        // const selected = window.getSelection().toString();
        // if (selected) {
        //   updateClipBoardData({
        //     dep: [],
        //     content: undefined,
        //   });
        //   return;
        // }
        // if (checkedId.length) {
        //   // 生成待保存的数据结构
        //   updateClipBoardData({
        //     dep: checkedId,
        //     content: extractDelCheckedData(cards, checkedId),
        //   });
        //   clipboard.writeText('copy-cardData', 'selection');
        //   // 删除选中的元素
        //   deleteCheckedNode(cards, checkedId);
        //   message.success('剪切成功');
        // }
        handleCut();
      } else if (e.ctrlKey && e.keyCode === 89) {
        handleRecovery();
      } else if (e.ctrlKey && e.keyCode === 90) {
        handleRevoke();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      electronLocalshortcut.unregister(win, 'Ctrl+C');
      electronLocalshortcut.unregister(win, 'Ctrl+V');
    };
  }, [checkedId, cards, clipboardData]);
};
