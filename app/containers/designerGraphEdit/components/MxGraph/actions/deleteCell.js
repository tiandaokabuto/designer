import React from 'react';

import mxgraph from '../mxgraph';

const { mxEventObject } = mxgraph;

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  const { deleteGraphDataMap, changeCheckedGraphBlockId } = opt;

  var cells = graph.getSelectionCells();
  graph.removeCells(cells);

  cells.forEach(item => {
    changeCheckedGraphBlockId('');
    deleteGraphDataMap(item.id);

    console.log(item.id);
  });

  graph.fireEvent(new mxEventObject('delete_cells'));
}
