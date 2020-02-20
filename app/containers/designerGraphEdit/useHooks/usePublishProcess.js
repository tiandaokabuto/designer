import { useSelector } from 'react-redux';
import transformEditorGraphData from '../RPAcore';

const publishProcess = graphData => () => {
  // 转化代码
  transformEditorGraphData(graphData);
};

export default () => {
  const graphData = useSelector(state => state.grapheditor.graphData);
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);
  console.log(graphDataMap);
  return publishProcess(graphData);
};
