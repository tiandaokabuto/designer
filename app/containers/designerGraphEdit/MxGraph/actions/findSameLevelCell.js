// 找所有的同级元素
export const findSameLevelCell = (graphData, id) => {
  console.log(`开始寻找-------------------\n`, graphData);
  return graphData.nodes.filter(node => {
    // 找sons
    if (node.parent === id) return true;
  });
};
