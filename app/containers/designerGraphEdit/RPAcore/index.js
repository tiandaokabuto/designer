import { findStartNode, findTargetIdBySourceId, findNodeById } from './utils';

const padding = length => '    '.repeat(length);

const transformEditorProcess = (graphData, currentId, result, depth = 1) => {
  // 判断当前的结点类型 流程块结点 或者是 判断结点
  const currentNode = findNodeById(graphData.nodes, currentId);
  switch (currentNode.shape) {
    case 'processblock':
      // 找到对应的流程块结点的数据结构
      result.output = 'def test():\n' + result.output;
      // 如果跟循环没有关系的话就直接执行当前的代码块
      result.output += `${padding(depth)}test()\n`;
      const next = findTargetIdBySourceId(graphData.edges, currentId);
      next && transformEditorProcess(graphData, next, result, depth);
      break;
    default:
    // do nothing
  }
};

export default graphData => {
  const result = {
    output: '',
  };
  console.log(graphData);
  const beginId = findStartNode(graphData.nodes || []);
  if (beginId) {
    console.log('开始解析流程图');
    result.output += "if __name__=='__main__':\n";
    transformEditorProcess(
      graphData,
      findTargetIdBySourceId(graphData.edges, beginId),
      result,
      1
    );
    console.log(result.output);
  }
};
