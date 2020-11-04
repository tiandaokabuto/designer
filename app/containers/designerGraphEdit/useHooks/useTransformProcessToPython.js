import { message } from 'antd';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import transformEditorGraphData, {
  claerTempCenter,
  sortEditorTree,
  clearCircleCounter,
} from '../RPAcore';

const transformProcessToPython = (graphDataRef, graphDataMapRef) => () => {
  claerTempCenter();
  // 用于判断是否存在回环
  clearCircleCounter();
  // 转化代码
  const temp = transformEditorGraphData(
    graphDataRef.current,
    graphDataMapRef.current,
    undefined,
    undefined
  );

  try {
    sortEditorTree();
  } catch (e) {
    console.log(e);
  }

  return temp;
};

// 将流程（整个第一层）转换为python代码
export default () => {
  // 取第一层 流程图-图 的数据
  // 取所有的 流程块-块 的数据
  const graphData = useSelector(state => state.grapheditor.graphData);
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  // 设一两个Ref来引用引用
  const graphDataRef = useRef(null);
  graphDataRef.current = graphData;

  const graphDataMapRef = useRef(null);
  graphDataMapRef.current = graphDataMap;

  // 执行转义流程
  return transformProcessToPython(graphDataRef, graphDataMapRef);
};
