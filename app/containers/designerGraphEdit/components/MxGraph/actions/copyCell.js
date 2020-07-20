import React from "react";

// 复制Cell
export function Action_CopyCell(graph, option = {}, callback = {}) {
  //console.clear();
  const { mxUtils, mxClipboard } = option;

  let cells = new Array();
  cells = graph.getSelectionCells();
  mxClipboard.copy(graph, cells);
}

// 粘贴Cell
export function Action_PasteCell(graph, option, callback = {}) {
  console.log(`完成粘贴_`, graph);
  const { mxClipboard } = option;
  mxClipboard.paste(graph);
}
