import uniqueId from 'lodash/uniqueId';

export default () => {
  //const graphData = useSelector(state => state.grapheditor.graphData);
  // const {
  //   grapheditor: {
  //     graphData, // 数据map
  //   },
  // } = store.getState();

  const isDuplicat = (arr, key) => {
    const length = arr.length;
    for (let i = 0; i < length; i++) {
      if (key === arr[i].id) {
        return true;
      }
    }
    return false;
  };

  const hasDataMap = (dataMap, id) => {
    const result = dataMap.get(id);
    return result;
  };
  return (graphData, graphDataMap) => {
    const nodes = graphData ? graphData.nodes : [];
    let id = uniqueId('mx_');
    // hasDataMap(graphDataMap, id);
    while (true) {
      if (isDuplicat(nodes, id) || hasDataMap(graphDataMap, id)) {
        id = uniqueId('mx_');
        continue;
      } else {
        return id;
      }
    }
  };
};
