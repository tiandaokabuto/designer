import React from "react";

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  const { deleteGraphDataMap, changeCheckedGraphBlockId } = opt;

  var cells = graph.getSelectionCells();
  graph.removeCells(cells);

  cells.forEach((item) => {
    changeCheckedGraphBlockId("");
    deleteGraphDataMap(item.id);

    console.log(item.id);
  });
}
