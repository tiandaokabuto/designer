import { message } from 'antd';

export const Rule_sizeRule = (graph, option = {}, callback) => {
  const { evt, graphData } = option;

  const resizeCells = evt.properties.cells;
  const resizeBounds = evt.properties.bounds;
  const resizePrevious = evt.properties.previous;

  if (resizeBounds[0].width < 210) {
    message.info('容器太小了')// + resizeCells[0].id);
    graph.resizeCells(resizeCells, resizePrevious);
  } else {
    // 找到他的所有子元素
    console.clear()
    console.log(evt.properties.cells, graph, graphData);
  }
};
