import React from "react";

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  console.log("删除所有cells的样式", graph.getDefaultParent(),graph.getChildVertices(graph.getDefaultParent()))
  graph.getChildVertices(graph.getDefaultParent()).forEach(cell=>{
    graph.removeCellOverlays(cell);
  })


  console.log(`准备开始删除_`, graph.selectionModel);
  var cells = graph.getSelectionCells();
  graph.removeCells(cells);

}
