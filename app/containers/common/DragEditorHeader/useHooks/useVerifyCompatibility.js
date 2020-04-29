import { message } from 'antd';

import store from '@/store';
import { encrypt } from '@/login/utils';
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
        [child.item.pkg + child.item.main + child.item.module]: child.item,
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
      traverseAllCards(child.elseChildren, callback);
    } else {
      callback && callback(child);
    }
  }
};

const getStandardProperties = shape => {
  switch (shape) {
    case 'processblock':
      return [
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
      ];
    case 'rhombus-node':
      return [
        {
          cnName: '标签名称',
          enName: 'label',
          value: '判断',
          default: '',
        },
        {
          cnName: '分支条件',
          enName: 'condition',
          value: '',
          default: '',
          valueMapping: [
            { name: '等于', value: '==' },
            { name: '不等于', value: '!=' },
            { name: '大于', value: '>' },
            { name: '小于', value: '<' },
            { name: '大于等于', value: '>=' },
            { name: '小于等于', value: '<=' },
            { name: '空', value: 'is None' },
            { name: '非空', value: 'not None' },
          ],
          tag: 1,
          valueList: [],
        },
      ];
    default:
      return [];
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

const isEqualType = (standard, current, isParam = false) => {
  let flag = true;
  for (const key in standard) {
    if (!hasOwnPropertyKey(standard, key)) {
      if (typeOf(standard[key]) !== typeOf(current[key])) {
        flag = false;

        current[key] = standard[key];
      } else {
        if (isPlainObject(standard[key])) {
          if (key === 'properties') {
            isParam = true;
          }
          if (flag) {
            flag = isEqualType(standard[key], current[key], isParam);
          } else {
            isEqualType(standard[key], current[key], isParam);
          }
        } else if (Array.isArray(standard[key])) {
          if (flag) {
            flag = isEqualType(standard[key], current[key], isParam);
          } else {
            isEqualType(standard[key], current[key], isParam);
          }
        } else {
          // 基本类型数据
          if (standard[key] !== current[key]) {
            //console.log(current, key, standard, isParam, '---类型相同, 值不同');

            if (!isParam) {
              // 满足以下条件的 new -> old
              flag = false;
              current[key] = standard[key];
            }
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
    const isEqual = isEqualType(
      standard[node.pkg + node.main + node.module],
      node
    );
    if (!isEqual) {
      flag = true;
      node.isCompatable = true;
    }
  });
  return flag;
};

const verifyBlockProperties = (current, standard) => {
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
      message.loading('正在校验', 0);
      const graphDataMap = JSON.parse(verifyNode.data.graphDataMap);

      const data = fs.readFileSync(
        `${process.cwd()}/globalconfig/config.json`,
        {
          encoding: 'utf-8',
        }
      );
      const { automicList = [] } =
        data.toString().indexOf('{') === -1
          ? JSON.parse(encrypt.argDecryptByDES(data.toString()))
          : JSON.parse(data.toString());
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
          verifyBlockProperties(
            item.properties,
            getStandardProperties(item.shape)
          ) || isCompatable;
        if (isCompatable) {
          hasModified = true;
          setGraphDataMap(key, item);
        }
      }
      if (hasModified) {
        changeModifyState(processTree, currentCheckedTreeNode, true);
      }
      message.destroy();
      message.success('校验完成');
    } catch (err) {
      console.log(err);
      message.destroy();
      message.error('校验失败');
    }
  };
};
