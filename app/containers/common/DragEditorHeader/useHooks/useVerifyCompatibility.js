import { message } from 'antd';

import store from '@/store';
import { findNodeByKey } from '../../utils';
import { setGraphDataMap } from '../../../reduxActions';

const fs = require('fs');

const getAutoMicListMap = automicList => {
  let result = {};
  for (const child of automicList) {
    if (child.children) {
      result = {
        ...result,
        ...getAutoMicListMap(child.children),
      };
    } else {
      result = {
        ...result,
        [child.item.main]: child.item,
      };
    }
  }
  return result;
};

const traverseAllCards = (cards, callback) => {
  for (const child of cards) {
    if (child.children) {
      callback && callback(child);
      traverseAllCards(child.children, callback);
    } else if (child.ifChildren) {
      callback && callback(child);
      traverseAllCards(child.ifChildren, callback);
    } else if (child.elseChildren) {
      callback && callback(child);
      traverseAllCards(child.elseChildren, callback);
    } else {
      callback && callback(child);
    }
  }
};

const isPlainObject = obj => {
  if (typeof obj !== 'object' || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
};

const hasOwnPropertyKey = (obj, key) => {
  return Object.hasOwnProperty(obj, key);
};

const typeOf = obj => {
  return Object.prototype.toString.call(obj);
};

const isEqualType = (standard, current) => {
  let flag = true;
  try {
    for (const key in standard) {
      if (!hasOwnPropertyKey(standard, key)) {
        if (typeOf(standard[key]) !== typeOf(current[key])) {
          console.log('不一致', current, key, standard);
          flag = false;
          // try fix
          current[key] = standard[key];
          throw new Error('err' + JSON.stringify(current[key]));
        }
        if (isPlainObject(standard[key])) {
          flag = isEqualType(standard[key], current[key]);
        } else if (Array.isArray(standard[key])) {
          flag = isEqualType(standard[key], current[key]);
        }
      }
    }
  } catch (err) {
    // console.log(err);
  } finally {
    return flag;
  }
};

const verifyCards = (current, standard) => {
  let flag = false;
  traverseAllCards(current, node => {
    const isEqual = isEqualType(standard[node.main], node);
    if (!isEqual) {
      flag = true;
    }
  });
  return flag;
};

export default () => {
  return () => {
    const {
      grapheditor: { currentCheckedTreeNode, processTree },
    } = store.getState();
    if (!currentCheckedTreeNode) {
      message.info('请选择流程进行校验');
      return;
    }
    const verifyNode = findNodeByKey(processTree, currentCheckedTreeNode);
    if (!verifyNode) return;
    try {
      const graphDataMap = JSON.parse(verifyNode.data.graphDataMap);

      const data = fs.readFileSync(
        `${process.cwd()}/globalconfig/config.json`,
        {
          encoding: 'utf-8',
        }
      );
      const { automicList = [] } = JSON.parse(data);
      const temp = automicList.find(item => item.key === 'aviable').children;
      const automicListMap = getAutoMicListMap(temp);
      for (const [key, item] of Object.entries(graphDataMap)) {
        let isCompatable = verifyCards(item.cards || [], automicListMap);
        if (isCompatable) {
          setGraphDataMap(key, item);
        }
      }
      console.log('校验完成');
    } catch (err) {
      // console.log(err);
    }
  };
};
