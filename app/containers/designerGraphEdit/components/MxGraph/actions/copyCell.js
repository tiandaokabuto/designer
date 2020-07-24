import React from "react";
import { message } from "antd";
import store from "../../../../../store";
import cloneDeep from 'lodash/cloneDeep';

// 复制Cell
export function Action_CopyCell(graph, option = {}, callback = {}) {
  //console.clear();
  const { mxClipboard, changeSavingModuleData } = option;

  let cells = new Array();
  cells = graph.getSelectionCells();


  mxClipboard.copy(graph, cells);

  console.clear();

  let temp = [];
  // 只复制cell当中不是线的元素
  cells.forEach((item) => {
    console.log(`将要复制 `, item.id, item.isVertex());
    if (item.isVertex()) {
      //temp.set(item.id, copyModule(item.id));
      temp.push(copyModule(item.id));
    }
  });

  // console.log(temp);
  // // 写入 俊杰的剪切板
  changeSavingModuleData(temp);

}






// 粘贴Cell
export function Action_PasteCell(graph, option, callback = {}) {
  const { mxClipboard, graphDataMapRef, setGraphDataMap } = option;
  const {
    grapheditor: {
      savingModuleData, // 俊杰的剪切板
    },
  } = store.getState();

  mxClipboard.paste(graph);


  console.clear();

  graph.selectionModel.cells.forEach((item, index) => {
    console.log(`\n\n!!!\n\n`, item.getId());
    if (item.isVertex()) {
      try {
        console.log(savingModuleData[index]);
        //newMap.set(item.getId(), savingModuleData[index]);
        setGraphDataMap(item.getId(), savingModuleData[index]);
      } catch (e) {
        console.log(e);
      }
    }
  });
}

const copyModule = (id) => {

  const {
    grapheditor: {
      graphDataMap, // 数据map
    },
  } = store.getState();
  console.log(graphDataMap)

  const { pythonCode, ...data } = graphDataMap.get(id);
  return data;
};
