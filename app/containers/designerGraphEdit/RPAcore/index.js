import uniqueId from 'lodash/uniqueId';
import { message } from 'antd';
import {
  findStartNode,
  findTargetIdBySourceId,
  findNodeById,
  findNodeByLabelAndId,
  isCircleExist,
  findCommonTarget,
  hasTwoEntryPoint,
  hasTwoEntryPortInProcessBlock,
} from './utils';

import { writeFileRecursive } from '../../../nodejs';

import { transformBlockToCode } from '../../designerGraphBlock/RPAcore';
import { updateEditorBlockPythonCode } from '../../reduxActions';
import transformVariable from './transformVariable';

const padding = length => '    '.repeat(length);

export const transformEditorProcess = (
  graphData,
  graphDataMap,
  currentId,
  result,
  depth = 1,
  breakPoint,
  notWhile = false
) => {
  // 判断当前的结点类型 流程块结点 或者是 判断结点
  const currentNode = findNodeById(graphData.nodes, currentId);
  if (currentId === breakPoint) return;
  const blockData = graphDataMap.get(currentId) || {};
  switch (currentNode.shape) {
    case 'processblock':
      // 停止解析
      // 找到对应的流程块结点的数据结构
      const params = blockData['properties'][1].value;
      const variable = blockData.variable || [];
      const funcName = `RPA_${currentId}`; //uniqueId('RPA_');
      result.output =
        `def ${funcName}(${params
          .filter(item => item.name)
          .map(item => item.name)
          .join(',')}):\n${transformBlockToCode(
          blockData.cards || [],
          1,
          blockData
        ).output || '\n'}` + result.output;

      if (
        !notWhile &&
        hasTwoEntryPortInProcessBlock(graphData.edges, currentId)
      ) {
        result.output += `${padding(depth)}while True:\n`;
        depth = depth + 1;
      }

      // 如果跟循环没有关系的话就直接执行当前的代码块
      // 解析当前模块传入的参数和返回的参数
      const return_string = blockData['properties'][2].value
        .map(item => item.name)
        .join(',');
      result.output += `${padding(depth)}${
        return_string ? return_string + ' = ' : ''
      }${funcName}(${params
        .filter(item => item.name)
        .map(item => item.name + ' = ' + item.value)
        .join(',')})\n`;
      const next = findTargetIdBySourceId(graphData.edges, currentId);
      next &&
        transformEditorProcess(
          graphData,
          graphDataMap,
          next,
          result,
          depth,
          breakPoint,
          false
        );
      break;
    case 'rhombus-node':
      /**
       * 情况一: 条件判断的分支具有相同的终点, 不属于循环的情况
       *    需要找到共同的终点，并在那个终点跳出对条件分支的解析，回归主分支
       *
       * 情况二: 条件判断其中有一个的分支在遍历的路径上又回到了自身, 属于循环的情况
       *    额外处理
       */
      const { value, valueList = [], tag = 2 } = blockData['properties'][1];
      let condition = '';
      if (tag === 2) {
        condition = value;
      } else {
        valueList.forEach((item, index) => {
          if (index === valueList.length - 1) {
            // 最后一个，不把连接符填上
            if (item.rule === 'is None' || item.rule === 'not None') {
              condition += `(${item.v1} ${item.rule}) `;
            } else {
              condition += `(${item.v1} ${item.rule} ${item.v2}) `;
            }
          } else {
            if (item.rule === 'is None' || item.rule === 'not None') {
              condition += `(${item.v1} ${item.rule}) ${item.connect} `;
            } else {
              condition += `(${item.v1} ${item.rule} ${item.v2}) ${item.connect} `;
            }
          }
        });
      }

      const isYesCircleExist = isCircleExist(
        graphData.edges,
        findNodeByLabelAndId(graphData.edges, currentId, '是'),
        currentId
      );

      const isNoCircleExist = isCircleExist(
        graphData.edges,
        findNodeByLabelAndId(graphData.edges, currentId, '否'),
        currentId
      );

      const isCircle = isYesCircleExist || isNoCircleExist;

      if (
        !isCircle ||
        findCommonTarget(
          graphData.edges,
          findNodeByLabelAndId(graphData.edges, currentId, '否'),
          findNodeByLabelAndId(graphData.edges, currentId, '是')
        )
      ) {
        // 当找到两者共同的点时结束条件判断的转译
        // 找到两者共同的结束点
        const breakPoint = findCommonTarget(
          graphData.edges,
          findNodeByLabelAndId(graphData.edges, currentId, '否'),
          findNodeByLabelAndId(graphData.edges, currentId, '是')
        );
        // 寻找label为是的出点进行解析
        const nextTrue = findNodeByLabelAndId(graphData.edges, currentId, '是');
        nextTrue && (result.output += `${padding(depth)}if ${condition}:\n`);
        nextTrue &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextTrue,
            result,
            depth + 1,
            breakPoint,
            false
          );
        nextTrue && (result.output += `${padding(depth + 1)}pass\n`);
        // 寻找label为否的出点进行解析
        const nextFalse = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          '否'
        );
        nextFalse && (result.output += `${padding(depth)}else:\n`);
        nextFalse &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextFalse,
            result,
            depth + 1,
            breakPoint,
            false
          );
        nextFalse && (result.output += `${padding(depth + 1)}pass\n`);
        // 从breakPoint处继续解析 此时要设置新的断点为 null
        breakPoint &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            breakPoint,
            result,
            depth,
            null,
            true
          );
      } else if (hasTwoEntryPoint(graphData.edges, currentId)) {
        result.output += `${padding(depth)}while ( True ):\n`;
        result.output += `${padding(depth + 1)}if${
          isYesCircleExist ? ' not' : ''
        } ${condition}:\n${padding(depth + 2)}break\n`;
        let nextLabel = isYesCircleExist ? '是' : '否';
        const nextNode = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          nextLabel
        );
        nextNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextNode,
            result,
            depth + 1,
            currentId,
            false
          );
        let breakLabel = isYesCircleExist ? '否' : '是';
        const breakNode = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          breakLabel
        );
        breakNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            breakNode,
            result,
            depth,
            null,
            false
          );
      } else {
        // 处理存在循环的情况
        result.output += `${padding(depth)}if${
          isYesCircleExist ? ' not' : ''
        } ${condition}:\n${padding(depth + 1)}break\n`;
        let nextLabel = isYesCircleExist ? '否' : '是';
        const nextNode = findNodeByLabelAndId(
          graphData.edges,
          currentId,
          nextLabel
        );
        nextNode &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextNode,
            result,
            depth - 1,
            null,
            false
          );
      }

      break;
    case 'end-node':
      // 停止解析
      break;
    default:
    // do nothing
  }
};

export default (graphData, graphDataMap, id, fromOrTo) => {
  console.log(id);
  console.log(fromOrTo);
  const result = {
    output: '',
  };
  const beginId = findStartNode(graphData.nodes || []);
  if (beginId) {
    result.output += "if __name__ == '__main__':\n";
    transformEditorProcess(
      graphData,
      graphDataMap,
      findTargetIdBySourceId(graphData.edges, beginId),
      result,
      1,
      null
    );
    result.output = '# -*- coding: UTF-8 -*-\n' + result.output;
    updateEditorBlockPythonCode(result.output);
    // 暂存到本地 project/python/temp.py
    writeFileRecursive(
      `${process.cwd()}/python/temp.py`,
      result.output,
      function() {
        console.log('保存成功');
      }
    );
  }
};
