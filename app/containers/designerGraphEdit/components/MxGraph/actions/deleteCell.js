import React from "react";

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  //console.clear();
  console.log(`准备开始删除_`, graph.selectionModel);
  // graph.removeSelectionCells(graph.selectionModel.cells);
  var cells = graph.getSelectionCells();
  graph.removeCells(cells);

  // graph.selectionModel.cells.forEach((cell) => {
  //   console.log(cell)
  //   console.log(cell.removeFromParent());
  // });
}
