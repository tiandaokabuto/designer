/**
 * (待测)
 */
import { message } from 'antd';

import store from '@/store';
import { encrypt } from '@/login/utils';
import {
  findNodeByKey,
  changeModifyState,
  getDecryptOrNormal,
} from '../../utils';
import { setGraphDataMap } from '../../../reduxActions';

const fs = require('fs');

// 获取所有的标准的原子能力数据结构描述。通过pkg + main + module字段的拼接来唯一确定
const getAutoMicListMap = (automicList) => {
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
// 遍历所有的原子能力结点
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

const getStandardProperties = (shape) => {
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

const isPlainObject = (obj) => {
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

const typeOf = (obj) => {
  return Object.prototype.toString.call(obj);
};

/**
 *
 * @param {*} standard
 * @param {*} current
 * @param {*} isParam  // 判断当前对比的对象是否是属性下边的字段 properties
 * // 跟参数面板无关的那些字段直接用新的去替换掉老的值
 */
const isEqualType = (standard, current, isParam = false) => {
  // 标记当前是否存在类型不兼容的情况
  let flag = true;
  for (const key in standard) {
    // 过滤掉原型上的属性
    if (!hasOwnPropertyKey(standard, key)) {
      // 判断两者是否为同一类型， 🌰: 原来判断结点的条件为string类型 后来为数组类型
      // 策略就是直接用新的数据结构去替换掉老的数据结构。
      if (typeOf(standard[key]) !== typeOf(current[key])) {
        flag = false;

        current[key] = standard[key];
      } else {
        if (isPlainObject(standard[key])) {
          if (key === 'properties') {
            // 已经进入了属性参数的类型校验
            isParam = true;
          }
          // 一旦 flag 从true修改成false, 那么就不对其再进行赋值。
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
  // 遍历所有的原子能力，并针对每个结点做类型校验。
  traverseAllCards(current, (node) => {
    const isEqual = isEqualType(
      standard[node.pkg + node.main + node.module],
      node
    );
    if (!isEqual) {
      // 标记当前存在类型不兼容的情况。
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
  // 校验逻辑入口函数
  return () => {
    const {
      grapheditor: { currentCheckedTreeNode, processTree },
    } = store.getState();
    if (!currentCheckedTreeNode) {
      message.info('请选择流程进行校验');
      return;
    }
    // 获取待校验的流程数据
    const verifyNode = findNodeByKey(processTree, currentCheckedTreeNode);
    if (!verifyNode) return;
    try {
      // 获取用户保存在本地的标准的原子能力数据结构描述。
      message.loading('正在校验', 0);
      const graphDataMap = JSON.parse(verifyNode.data.graphDataMap);

      const data = fs.readFileSync(
        `${process.cwd()}/globalconfig/config.json`,
        {
          encoding: 'utf-8',
        }
      );
      const { automicList = [] } = getDecryptOrNormal(data);
      const temp = automicList.find((item) => item.key === 'aviable').children;
      const automicListMap = getAutoMicListMap(temp);
      let isCompatable = false;
      let hasModified = false;
      // item对应的是流程图的结点
      for (const [key, item] of Object.entries(graphDataMap)) {
        // 校验原子能力部分的类型是否兼容
        isCompatable = verifyCards(item.cards || [], automicListMap);

        // 校验流程块结点的属性的类型是否兼容
        isCompatable =
          verifyBlockProperties(
            item.properties || [],
            getStandardProperties(item.shape)
          ) || isCompatable;
        // 一旦存在不兼容的情况就重新设置该部分的数据结构
        if (isCompatable) {
          hasModified = true;
          setGraphDataMap(key, item);
        }
      }
      // 判断是否存在类型不兼容，部分原子能力的描述被修改的情况，标记当前的流程处于修改的状态。
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
