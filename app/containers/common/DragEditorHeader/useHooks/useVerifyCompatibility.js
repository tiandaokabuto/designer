import { message } from 'antd';

import store from '@/store';
import { findNodeByKey, changeModifyState } from '../../utils';
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
  for (const key in standard) {
    console.log(standard, current, '----', key);
    if (!hasOwnPropertyKey(standard, key)) {
      if (typeOf(standard[key]) !== typeOf(current[key])) {
        flag = false;
        // try fix
        console.log(current, key, standard, '---类型不同');
        current[key] = standard[key];
      } else {
        if (isPlainObject(standard[key])) {
          if (flag) {
            flag = isEqualType(standard[key], current[key]);
          } else {
            isEqualType(standard[key], current[key]);
          }
        } else if (Array.isArray(standard[key])) {
          if (flag) {
            flag = isEqualType(standard[key], current[key]);
          } else {
            isEqualType(standard[key], current[key]);
          }
        } else {
          // 基本类型数据
          if (standard[key] !== current[key]) {
            console.log(current, key, standard, '---类型相同, 值不同');
            // 满足以下条件的 new -> old
            flag = false;
            current[key] = standard[key];
          }
        }
      }
    }
  }
  return flag;
};

const verifyCards = (current, standard) => {
  let flag = false;
  traverseAllCards(current, node => {
    const isEqual = isEqualType(standard[node.main], node);
    if (!isEqual) {
      flag = true;
      // node.isCompatable = true;
    }
    if (node.isCompatable) {
      // node.isCompatable = false;
      flag = true;
    }
  });
  return flag;
};

const verifyBlockProperties = (current, standard) => {
  console.log(current, standard);
  let flag = false;
  standard.forEach((node, index) => {
    const isEqual = isEqualType(node, current[index]);
    if (!isEqual) {
      flag = true;
      // node.isCompatable = true;
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
      let isCompatable = false;
      let hasModified = false;
      for (const [key, item] of Object.entries(graphDataMap)) {
        // console.log(item);
        if (!Array.isArray(item.cards)) {
          item.cards = [];
        }
        isCompatable = verifyCards(item.cards || [], automicListMap);
        if (!Array.isArray(item.properties)) {
          item.properties = [];
        }
        isCompatable =
          verifyBlockProperties(item.properties, [
            {
              cnName: '标签名称',
              enName: 'label',
              value: '流程块',
              default: '',
            },
            {
              cnName: '输入参数',
              enName: 'param',
              value: [],
              default: '',
            },
            {
              cnName: '流程块返回',
              enName: 'output',
              value: [],
              default: '',
            },
          ]) || isCompatable;
        if (isCompatable) {
          hasModified = true;
          setGraphDataMap(key, item);
        }
      }
      if (hasModified) {
        changeModifyState(processTree, currentCheckedTreeNode, true);
      }
      console.log('校验完成');
    } catch (err) {
      // console.log(err);
    }
  };
};
