import { useSelector } from 'react-redux';
import transformEditorGraphData from '../RPAcore';

const publishProcess = (graphData, graphDataMap) => () => {
  // 转化代码
  transformEditorGraphData(graphData, graphDataMap);
};

export default () => {
  const graphData = useSelector(state => state.grapheditor.graphData);
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  console.log(graphDataMap);
  return publishProcess(graphData, graphDataMap);
};
