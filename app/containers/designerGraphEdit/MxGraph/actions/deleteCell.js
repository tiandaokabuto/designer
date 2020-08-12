import React from 'react';
import { message } from 'antd';
import { deleteCellAction } from '../mxgraphAction';
import { getNodeInfo } from '../rules/checkRules';

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  const { deleteGraphDataMap, changeCheckedGraphBlockId, graphData } = opt;

  const cells = graph.getSelectionCells();
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


