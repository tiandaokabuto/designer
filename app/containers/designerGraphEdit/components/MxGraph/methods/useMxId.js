import { useStore, useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';

export default () => {
  const graphData = useSelector(state => state.grapheditor.graphData);
  const isDuplicat = (arr, key) => {
    const length = arr.length;
    for (let i = 0; i < length; i++) {
      if (key === arr[i].id) {
        return true;
      }
    }
    return false;
  };
  return () => {
    const nodes = graphData ? graphData.nodes : [];
    let id = uniqueId('mx_');

    while (true) {
      if (isDuplicat(nodes, id)) {
        id = uniqueId('mx_');
        continue;
      } else {
        return id;
      }
    }
  };
};
