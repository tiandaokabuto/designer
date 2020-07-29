import React from 'react';

import { deleteCellAction } from '../mxgraphAction';

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  const { deleteGraphDataMap, changeCheckedGraphBlockId } = opt;

  console.log('前', graph.getModel());

  const cells = graph.getSelectionCells();
  graph.removeCells(cells, true);

  cells.forEach(cell => {
    for (const [key, item] of Object.entries(graph.getModel().cells)) {
      if (cell.id === item.id) {
        deleteGraphDataMap(item.id);
        delete graph.getModel().cells[key];
      }
    }
  });

  console.log('后', graph.getModel());

  changeCheckedGraphBlockId('');

  deleteCellAction(graph);
}
