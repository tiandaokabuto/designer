import { message } from 'antd';

export const Rule_sizeRule = (graph, option = {}, callback) => {
  const { evt, graphData, updateGraphDataAction } = option;

  const resizeCells = evt.properties.cells;
  const resizeBounds = evt.properties.bounds;
  const resizePrevious = evt.properties.previous;

  //if(!resizeBounds[0]) return;
  console.log(resizeCells, resizePrevious);

  if (resizeBounds[0].width < 210) {
    message.info('容器小于最小尺寸'); // + resizeCells[0].id);
    graph.resizeCells(resizeCells, resizePrevious);
    return updateGraphDataAction(graph);
  } else {
    // 1 找到他的所有子元素
    const sameLevelCells = findSameLevelCell(
      graphData,
      evt.properties.cells[0].id
    );
    // console.log(sameLevelCells);
    // 2 判断当前的父子大小是否符合要求
    // console.log(checkSize(sameLevelCells));
    sameLevelCells.father = {
      w: resizeBounds[0].width,
      h: resizeBounds[0].height,
    };
    const error = checkSize(
      graph,
      sameLevelCells,
      false,
      updateGraphDataAction
    );

    // 假如校验通过，则允许他改大小
    if (!error.ans) return;

    // 假如校验不通过，则改为至少能够满足的最小尺寸
    message.info('容器小于内部元素尺寸');

    console.log((resizePrevious[0].width = error.minSize.w));
    console.log((resizePrevious[0].height = error.minSize.h)); //error.minSize.h);

    console.log(resizePrevious[0]);
    graph.resizeCells(resizeCells, resizePrevious);
    updateGraphDataAction(graph);
    graph.refresh();
  }
};

const find_id = (id, graph) => {
  const model = graph.getModel();
  let temp = {};
  for (const [key, item] of Object.entries(model.cells)) {
    if (item.id === id) {
      temp = item;
    }
  }
  return temp;
};

export const Rule_move_sizeRule = (id, parentId, opt) => {
  const { graphData, graph, evt, updateGraphDataAction } = opt;
  // 1 找到他的所有子元素
  const sameLevelCells = findSameLevelCell(graphData, parentId);
  const fatherCell = find_id(parentId, graph);
  sameLevelCells.father = {
    w: fatherCell.geometry.width,
    h: fatherCell.geometry.height,
  };

  //console.clear();
  console.log(fatherCell);
  console.log(evt);
  const error = checkSize(
    graph,
    sameLevelCells,
    evt.properties.cells[0],
    updateGraphDataAction
  );

  // 假如校验通过，则允许他改大小
  if (!error.ans) return;

  console.log([fatherCell], [fatherCell.geometry]);
  console.log((fatherCell.geometry.width = error.minSize.w));
  console.log((fatherCell.geometry.height = error.minSize.h)); //error.minSize.h);]
  console.log([fatherCell], [fatherCell.geometry]);

  // 假如校验不通过，则改为至少能够满足的最小尺寸
  message.info('容器小于内部元素尺寸');

  graph.resizeCells([fatherCell], [fatherCell.geometry]);
  updateGraphDataAction(graph);
  graph.refresh();
};

// 找所有的同级元素
export const findSameLevelCell = (graphData, id) => {
  console.log(`开始寻找-------------------\n`, graphData);
  //let father;
  const getSize = node => {
    return {
      shape: node.shape,
      w: node.size ? parseInt(node.size.split('*')[0]) : -1,
      h: node.size ? parseInt(node.size.split('*')[1]) : -1,
      pos_x: parseInt(node.x),
      pos_y: parseInt(node.y),
      cell: node,
    };
  };

  let sons = graphData.nodes.filter(node => {
    // // 赋值father
    // if (node.id === id) {
    //   father = getSize(node);
    // }
    // 找sons
    if (node.parent === id) return true;
  });

  sons = sons.map(node => {
    // 赋值son
    return getSize(node);
  });

  // 假如是移动，需要传moreCheck用于进一步检查

  return {
    // father,
    sons,
  };
};

// 检查尺寸是否符合要求
const checkSize = (
  graph,
  sameLevelCells,
  moreCheck = false,
  updateGraphDataAction
) => {
  const { father, sons } = sameLevelCells;

  let error = {
    minSize: {
      w: father.w,
      h: father.h,
      dx: 0,
      dy: 0,
    },
    ans: false,
  };
  sons.forEach(son => {
    // 判断所有的右侧是否超限
    console.log(`father-w-son`, father.w, son.pos_x + son.w);
    if (son.pos_x + son.w > father.w) {
      // 假如原有尺寸本来就不够当前元素用，则自动扩大
      if (son.pos_x + son.w > error.minSize.w) {
        error.minSize.w = son.pos_x + son.w + 20;
      }
      error.ans = true;
    }
    // 判断所有的下侧是否超限
    if (son.pos_y + son.h > father.h) {
      if (son.pos_y + son.h > error.minSize.h) {
        error.minSize.h = son.pos_y + son.h + 20;
      }
      error.ans = true;
    }

    if (son.pos_x < 0 || son.pos_y - 30 < 0) {
      //message.warning('要矫正');
      console.log(son.cell);
      graph.moveCells(
        [son.cell],
        son.pos_x < 0 ? -son.pos_x : 0,
        son.pos_y - 30 < 0 ? -son.pos_y + 30 : 0
      );
    }
  });

  // 假如是移动，需要传moreCheck用于进一步检查
  if (moreCheck.geometry) {
    const geo = moreCheck.geometry;
    if (geo.x + geo.width > father.w) {
      // 假如原有尺寸本来就不够当前元素用，则自动扩大
      if (geo.x + geo.width > error.minSize.w) {
        error.minSize.w = geo.x + geo.width + 20;
      }

      error.ans = true;
    }
    // 判断所有的下侧是否超限
    if (geo.y + geo.height > father.h) {
      if (geo.y + geo.height > error.minSize.h) {
        error.minSize.h = geo.y + geo.height + 20;
      }
      error.ans = true;
    }

    if (geo.x < 0 || geo.y - 30 < 0) {
      //message.warning('要TM矫正');
      graph.moveCells(
        [moreCheck],
        geo.x < 0 ? -geo.x : 0,
        geo.y - 30 < 0 ? -geo.y + 30 : 0
      );
    }
  }

  updateGraphDataAction(graph);

  return error;
};

export const getMiddleWidth = (cellWidth, parentWidth) => {
  return parentWidth / 2 - cellWidth / 2;
};

export const getMiddleHeight = (cellHeight, parentHeight) => {
  return parentHeight / 2 - cellHeight / 2;
};

export const getSibilings = (graphData, cellId, parentId) => {
  const { nodes, edges } = graphData;

  const sibilings = nodes.filter(
    item =>
      item.parent === parentId &&
      item.label !== 'catch' &&
      item.label !== 'finally'
  );

  return sibilings;
};

export const getLastHeight = (
  cellHeight,
  parentHeight,
  cellY,
  parentY,
  sibilings = [],
  graph
) => {
  // let lastHeight = 0;
  if (sibilings.length === 0) {
    return 30 + 20;
  } else {
    const [lastY, height] = sibilings.reduce(
      (pre, cur) => {
        const target = find_id(cur.id, graph);
        const geometry = target.getGeometry();
        if (geometry.y > pre[0]) {
          return [geometry.y, geometry.height];
        } else {
          return pre;
        }
      },
      [0, 0]
    );
    console.log(lastY, height);
    return lastY + height + 20;
    // sibilings.forEach(item => {
    //   const target = find_id(item.id, graph);
    //   const geometry = target.getGeometry()

    //   // if(target.size.split('*')[1])
    // });
  }
};
