import uniqueId from 'lodash/uniqueId';
import {
  findStartNode,
  findTargetIdBySourceId,
  findNodeById,
  findNodeByLabelAndId,
  isCircleExist,
  findCommonTarget,
  hasTwoEntryPortInProcessBlock,
} from './utils';

import { transformBlockToCode } from '../../designerGraphBlock/RPAcore';

const padding = length => '    '.repeat(length);

const transformEditorProcess = (
  graphData,
  graphDataMap,
  currentId,
  result,
  depth = 1,
  breakPoint
) => {
  // 判断当前的结点类型 流程块结点 或者是 判断结点
  const currentNode = findNodeById(graphData.nodes, currentId);
  if (currentId === breakPoint) return;
  switch (currentNode.shape) {
    case 'processblock':
      // 停止解析
      const blockData = graphDataMap.get(currentId) || {};
      // 找到对应的流程块结点的数据结构
      const funcName = uniqueId('RPA_');
      result.output =
        `def ${funcName}(*argv, **kw):\n${transformBlockToCode(
          blockData.cards || [],
          1
        ).output || '\n'}` + result.output;
      // 如果跟循环有关系需要添加循环语句
      if (hasTwoEntryPortInProcessBlock(graphData.edges, currentId)) {
        console.log('存在两个点');
        result.output += `${padding(depth)}while True:\n`;
        depth = depth + 1;
      }
      // 如果跟循环没有关系的话就直接执行当前的代码块
      // 解析当前模块传入的参数和返回的参数
      const params = blockData['properties'][0].value;
      const return_string = blockData['properties'][1].value;
      result.output += `${padding(depth)}${
        return_string ? return_string + ' = ' : ''
      }${funcName}(${params})\n`;
      const next = findTargetIdBySourceId(graphData.edges, currentId);
      next &&
        transformEditorProcess(
          graphData,
          graphDataMap,
          next,
          result,
          depth,
          breakPoint
        );
      break;
    case 'rhombus-node':
      console.log('判断结点');
      /**
       * 情况一: 条件判断的分支具有相同的终点, 不属于循环的情况
       *    需要找到共同的终点，并在那个终点跳出对条件分支的解析，回归主分支
       *
       * 情况二: 条件判断其中有一个的分支在遍历的路径上又回到了自身, 属于循环的情况
       *    额外处理
       */

      const isCircle =
        isCircleExist(
          graphData.edges,
          findNodeByLabelAndId(graphData.edges, currentId, '是'),
          currentId
        ) ||
        isCircleExist(
          graphData.edges,
          findNodeByLabelAndId(graphData.edges, currentId, '否'),
          currentId
        );
      if (!isCircle) {
        // 当找到两者共同的点时结束条件判断的转译
        // 找到两者共同的结束点
        const breakPoint = findCommonTarget(
          graphData.edges,
          findNodeByLabelAndId(graphData.edges, currentId, '否'),
          findNodeByLabelAndId(graphData.edges, currentId, '是')
        );
        // 寻找label为是的出点进行解析
        const nextTrue = findNodeByLabelAndId(graphData.edges, currentId, '是');
        nextTrue && (result.output += `${padding(depth)}if a > 0:\n`);
        nextTrue &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            nextTrue,
            result,
            depth + 1,
            breakPoint
          );
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
            breakPoint
          );
        // 从breakPoint处继续解析 此时要设置新的断点为 null
        breakPoint &&
          transformEditorProcess(
            graphData,
            graphDataMap,
            breakPoint,
            result,
            depth,
            null
          );
      } else {
        // 处理存在循环的情况
        console.log('存在环');
        result.output += `${padding(depth)}if b > 0:\n${padding(
          depth + 1
        )}break`;
      }

      break;
    case 'end-node':
      // 停止解析
      break;
    default:
    // do nothing
  }
};

export default (graphData, graphDataMap) => {
  const result = {
    output: '',
  };
  console.log(graphData);
  const beginId = findStartNode(graphData.nodes || []);
  if (beginId) {
    console.log('开始解析流程图');
    result.output += "if __name__ == '__main__':\n";
    transformEditorProcess(
      graphData,
      graphDataMap,
      findTargetIdBySourceId(graphData.edges, beginId),
      result,
      1,
      null
    );
    console.log(result.output);
  }
};
