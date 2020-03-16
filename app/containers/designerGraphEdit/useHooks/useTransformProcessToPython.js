import { useRef } from 'react';
import { useSelector } from 'react-redux';
import transformEditorGraphData from '../RPAcore';

const transformProcessToPython = (graphDataRef, graphDataMapRef) => () => {
  // 转化代码
  transformEditorGraphData(graphDataRef.current, graphDataMapRef.current);
};

export default () => {
  const graphData = useSelector(state => state.grapheditor.graphData);
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const graphDataRef = useRef(null);
  graphDataRef.current = graphData;

  const graphDataMapRef = useRef(null);
  graphDataMapRef.current = graphDataMap;

  return transformProcessToPython(graphDataRef, graphDataMapRef);
};
