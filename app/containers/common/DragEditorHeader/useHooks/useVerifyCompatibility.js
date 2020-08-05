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
} from '_utils/utils';
import { setGraphDataMap } from '../../../reduxActions';

const fs = require('fs');

// 获取所有的标准的原子能力数据结构描述。通过pkg + main + module字段的拼接来唯一确定
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

/**
 * 是否是旧的xpath结构
 * @param {*} propertie xpath的属性
 */
const isOldxPath = propertie => {
  return (
    propertie.enName === 'xpath' &&
    propertie.value !== '""' &&
    propertie.cnName === '元素XPath' &&
    // !/^"{/.test(propertie.value)
    (propertie.config === undefined ||
      JSON.stringify(propertie.config) === '{}')
  );
};

/**
 * 升级xpath
 * @param {*} propertie xpath的属性
 */
const handleOldPath = propertie => {
  let originValue = propertie.value;
  /*   if (/^"{\\/.test(originValue)) {
    originValue = JSON.parse(JSON.parse(originValue)).XPath;
  } else if (/^"/.test(originValue) && /"$/.test(originValue)) {
    originValue = propertie.value.substring(1, propertie.value.length - 1);
  } */
  // const value = { XPath: originValue, iframe: [] };
  const config = {
    XPath: [],
    JSpath: [],
    iframe: [],
    selectedOption: 'xpath',
  };
  propertie.config = config;
  propertie.value = originValue;
  propertie._value = originValue;
  return true;
  // }
};

/**
 * 递归判断是否存在参数是否存在变更
 * @param {*} standard 新参数
 * @param {*} current 被比对的现在使用的参数
 * @param {*} isParam 是否属于原子能力中的参数
 * @param {*} propertiesKey 父节点可能需要更动value的键值
 * @param {*} fatherNode 父节点
 */
const isEqualType = (
  standard,
  current,
  isParam = false,
  propertiesKey,
  fatherNode
) => {
  // 标记当前是否存在类型不兼容的情况
  let flag = true;
  // 如果key满足，根据新数组寻找旧数据对应的数据，进行精准对比
  if (propertiesKey === 'optional' || propertiesKey === 'required') {
    // 创建一个数值，寻找到的数据push进来，新增的数据push进来，删除的将不push，最终生成正确顺序的数组并替换现有数组
    const newCurrent = [];
    standard.forEach((item, index) => {
      const { enName } = item;
      const findIndex = current.findIndex(
        currentItem => currentItem.enName === enName
      );
      if (findIndex > -1) {
        if (isOldxPath(current[findIndex])) {
          flag = handleOldPath(current[findIndex]);
        }
        // 当前存在这条属性，递归判断
        if (flag) {
          flag = isEqualType(
            standard[index],
            current[findIndex],
            isParam,
            findIndex,
            current
          );
        } else {
          isEqualType(
            standard[index],
            current[findIndex],
            isParam,
            findIndex,
            current
          );
        }
        newCurrent.push(current[findIndex]);
      } else {
        // 当前没有这个属性，把新增属性push进新
        flag = false;
        newCurrent.push(standard[index]);
      }
    });
    // 替换现有数组
    fatherNode[propertiesKey] = newCurrent;
  } else {
    for (const key in standard) {
      // 过滤掉原型上的属性
      if (!hasOwnPropertyKey(standard, key)) {
        // 判断两者是否为同一类型， 🌰: 原来判断结点的条件为string类型 后来为数组类型
        // 策略就是直接用新的数据结构去替换掉老的数据结构。
        // 第二版： 忽略参数面板中各个参数的类型不一致
        if (!isParam && typeOf(standard[key]) !== typeOf(current[key])) {
          flag = false;
          current[key] = standard[key];
        } else if (
          // 参数面板如果整个参数类型不一致，直接进行全属性替换并且提示红框
          isParam &&
          key === 'componentType' &&
          standard[key] !== current[key]
        ) {
          flag = false;
          if (fatherNode) {
            fatherNode[propertiesKey] = standard;
            break;
          }
        } else if (isPlainObject(standard[key])) {
          // 处理对象
          if (key === 'properties') {
            // 已经进入了属性参数的类型校验P
            isParam = true;
          }
          // 一旦 flag 从true修改成false, 那么就不对其再进行赋值。
          if (flag) {
            flag = isEqualType(standard[key], current[key], isParam);
          } else {
            isEqualType(standard[key], current[key], isParam);
          }
        } else if (Array.isArray(standard[key])) {
          // 处理数组
          // 对optional和required属性面板相关数组进行enName的精准替换，（原因value值要保留）
          // 否则对数组内容进行全替换
          if (isParam) {
            if (key === 'optional' || key === 'required') {
              if (flag) {
                flag = isEqualType(
                  standard[key],
                  current[key],
                  isParam,
                  key,
                  current
                );
              } else {
                isEqualType(standard[key], current[key], isParam, key, current);
              }
            } else {
              current[key] = standard[key];
            }
          }
        } else if (current && standard[key] !== current[key]) {
          // 如果不是参数面板上的值，而且值时基本数据类型，替换成新值
          if (!isParam && key !== 'value') {
            flag = false;
            current[key] = standard[key];
          }
        } else if (current === undefined && standard && fatherNode) {
          // 对象属性缺失，添加属性（好像是针对paramType空数组用的，后面看看能不能删掉）
          fatherNode[propertiesKey] = standard;
          break;
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
      const temp = automicList.find(item => item.key === 'aviable').children;
      const automicListMap = getAutoMicListMap(temp);
      let isCompatable = false;
      let hasModified = false;
      // item对应的是流程图的结点
      for (const [key, item] of Object.entries(graphDataMap)) {
        if (item.shape === 'processblock') {
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
        } else if (item.shape === 'rhombus-node') {
          item.properties.forEach(proItem => {
            if (proItem.enName === 'condition') {
              const flag = proItem.hasOwnProperty('valueMapping');
              if (!flag) {
                proItem.valueMapping = [
                  { name: '等于', value: '==' },
                  { name: '不等于', value: '!=' },
                  { name: '大于', value: '>' },
                  { name: '小于', value: '<' },
                  { name: '大于等于', value: '>=' },
                  { name: '小于等于', value: '<=' },
                  { name: '空', value: 'is None' },
                  { name: '非空', value: 'not None' },
                ];
                proItem.valueList = [];
                hasModified = true;
                setGraphDataMap(key, item);
              }
            }
          });
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
