import uniqueId from 'lodash/uniqueId';
import store from '../../../../../store';

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
  return graphData => {
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
