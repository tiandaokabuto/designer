import React from 'react';
import { message } from 'antd';
import { deleteCellAction } from '../mxgraphAction';
import { getNodeInfo } from '../rules/checkRules';

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  const { deleteGraphDataMap, changeCheckedGraphBlockId, graphData } = opt;

  const cells = graph.getSelectionCells();

  if (cells.length > 1) {
    return message.info('不能同时选中多个进行删除');
  }

  let error = false;
  const checkSonsHasProcess = sons => {
    sons.forEach(son => {
      console.log(son);
      if (son.shape === 'processblock') {
        return (error = true);
      } else {
        checkSonsHasProcess(findSameLevelCell(graphData, son.id));
      }
    });
  };

  if (cells[0].value === 'try') {
    const sons = findSameLevelCell(graphData, cells[0].id);
    checkSonsHasProcess(sons);
    if(error) return message.info("不能删除非空的容器，请先删除内部流程块或拖出内部流程块后删除");
  } else if (cells[0].value === 'catch' || cells[0].value === 'finally') {
    return message.info('try和catch块不能单独删除');
  }

  // let lock = false;
  // cells.forEach(cell => {
  //   console.log(getNodeInfo(cell.id, graphData));
  //   if (
  //     getNodeInfo(cell.id, graphData).shape === 'catch' ||
  //     getNodeInfo(cell.id, graphData).shape === 'finally'
  //   ) {
  //     lock = true;
  //   }
  // });

  // if (lock) {
  //   return message.warning('catch finally属于异常捕获容器，不能直接删除');
  // }

  graph.removeCells(cells, true);

  cells.forEach(cell => {
    for (const [key, item] of Object.entries(graph.getModel().cells)) {
      if (cell.id === item.id) {
        deleteGraphDataMap(item.id);
        delete graph.getModel().cells[key];
      }
    }
  });

  changeCheckedGraphBlockId('');

  deleteCellAction(graph);
}

// 找所有的同级元素
const findSameLevelCell = (graphData, id) => {
  console.log(`开始寻找-------------------\n`, graphData);
  return graphData.nodes.filter(node => {
    // 找sons
    if (node.parent === id) return true;
  });
};
