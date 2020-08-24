export const Action_findNode = (keyName = 'key', searchName, graphData) => {
  // keyName = "value" 找value值为开始结束的数据是否存在
  switch (keyName) {
    case 'nodes.label':
      // 假如能找到 开始或结束 或searchName
      console.log(graphData.nodes);
      if (graphData.nodes.findIndex(item => item.shape === searchName) !== -1) {
        return true;
      } else {
        return false;
      }
  }
};
