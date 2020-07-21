import React from "react";

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  console.log(`准备开始删除_`, graph.selectionModel);
  var cells = graph.getSelectionCells();
  graph.removeCells(cells);

}
