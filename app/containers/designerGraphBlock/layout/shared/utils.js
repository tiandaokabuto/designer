import { LoopStatementTag, ConditionalStatementTag } from '../statementTags';
import {
  PLACEHOLDER_MAINPROCESS,
  PLACEHOLDER_CONDITIONALSTATEMENT,
} from '../statementTypes';
import cloneDeep from 'lodash/cloneDeep';

/**
 * (已进行单元测试)
 * @param {*} cards
 * @param {*} id
 * @param {*} isTail
 */
export const findNodeLevelById = (cards, id, isTail) => {
  const find = cards.find((item) => item.id === id);
  if (find) {
    if (isTail) {
      return find.children;
    }
    return cards;
  }
  for (let i = 0; i < cards.length; i++) {
    let flag = false;
    if (cards[i].children) {
      flag = findNodeLevelById(cards[i].children, id, isTail);
      if (flag) return flag;
    }
    if (cards[i].ifChildren) {
      flag = findNodeLevelById(cards[i].ifChildren, id, isTail);
      if (flag) return flag;
    }
    if (cards[i].elseChildren) {
      flag = findNodeLevelById(cards[i].elseChildren, id, isTail);
      if (flag) return flag;
    }
  }
  return undefined;
};

/**
 * (已进行单元测试)
 * @param {*} cards
 * @param {*} id
 * @param {*} layer
 */
export const findIFNodeLevelById = (cards, id, layer) => {
  const find = cards.find((item) => item.id === id);
  if (find) {
    return layer ? find[layer] : find;
  }
  for (let i = 0; i < cards.length; i++) {
    let flag = false;
    if (cards[i].children) {
      flag = findIFNodeLevelById(cards[i].children, id, layer);
      if (flag) return flag;
    }
    if (cards[i].ifChildren) {
      flag = findIFNodeLevelById(cards[i].ifChildren, id, layer);
      if (flag) return flag;
    }
    if (cards[i].elseChildren) {
      flag = findIFNodeLevelById(cards[i].elseChildren, id, layer);
      if (flag) return flag;
    }
  }
  return undefined;
};

/**
 * 查找当前id对应的代码块数据结构
 * @param {*} cards
 * @param {*} id
 */
export const findNodeById = (cards, id) => {
  const find = findNodeLevelById(cards, id, false);
  if (find) {
    return find.find((node) => node.id === id);
  }
  return undefined;
};

/**
 * (已进行单元测试)
 * @param {*} cards
 * @param {*} id
 * @param {*} append
 */
export const insertAfter = (cards, id, append) => {
  if (!cards.length) {
    cards.push(...append);
    return true;
  }
  const find = findNodeLevelById(cards, id, false);
  if (find) {
    const index = find.findIndex((node) => node.id === id);
    find.splice(index + 1, 0, ...append);
    return true;
  } else {
    return false;
  }
};

/**
 * (已进行单元测试)
 * 判断当前结点是否是正在拖拽结点的子结点
 * @param {*} node
 * @param {*} id
 */
export const isChildrenNode = (parent, child) => {
  if (!child) return false;
  const id = child.id.includes('tail')
    ? child.id.replace(/-(.*)/, '')
    : child.id;
  return (
    findNodeLevelById(parent.children || [], id) ||
    id === parent.id ||
    findNodeLevelById(parent.ifChildren || [], id) ||
    findNodeLevelById(parent.elseChildren || [], id)
  );
};

/**
 * 复用已有的结点结构生成新的结点
 */

export const useNode = (node, id) => {
  delete node['effectTag'];
  delete node['type'];
  delete node['index'];
  if (node.$$typeof & LoopStatementTag) {
    node.children = [];
  } else if (node.$$typeof & ConditionalStatementTag) {
    node.ifChildren = [];
    node.elseChildren = [];
  }
  node.id = id;
  return cloneDeep(node);
};

/**
 *
 * @param {*} id 主流程占位符代码块id
 */
export const isMainProcessPlaceholder = (id) => {
  return id && PLACEHOLDER_MAINPROCESS.includes(id);
};

/**
 *
 * @param {*} id 条件语句占位符代码块id
 */
export const isConditionalStatementPlaceholder = (id) => {
  return id && id.includes(PLACEHOLDER_CONDITIONALSTATEMENT);
};

/**
 * 提取条件语句分支
 * @param {*} id
 */
export const extractLayer = (id) => {
  return id && /-(.*)/.exec(id)[1];
};

/**
 * 判断是否为占位符代码块
 */
export const isTailStatement = (id) => {
  return id && id.includes('tail');
};

/**
 * 剔除代码块的id为纯id的格式
 */
export const trimId = (id) => {
  return id && id.replace(/-.*/, '');
};
