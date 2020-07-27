import React from 'react';
import { message } from 'antd';
import store from '../../../../../store';
import cloneDeep from 'lodash/cloneDeep';
import useMxId from '../methods/useMxId';
import { updateGraphDataAction } from '../mxgraphAction';

// 复制Cell
export function Action_CopyCell(graph, option = {}, callback = {}) {
  //console.clear();

  const { mxClipboard, changeSavingModuleData } = option;

  let cells = new Array();
  cells = graph.getSelectionCells();

  mxClipboard.copy(graph, cells);

  //console.clear();

  let temp = [];
  let errorFlag = false;
  // 只复制cell当中不是线的元素
  cells.forEach(item => {
    console.log(`将要复制 `, item, item.id, item.isVertex());
    if (item.value === '开始' || item.value === '结束') {
      errorFlag = true;
      return message.info({ content: '开始、结束不能复制', key: 'copy' });
    }
    if (item.isVertex()) {
      //temp.set(item.id, copyModule(item.id));
      temp.push(copyModule(item.id));
    }
  });

  if (errorFlag) return (lock = true);

  // console.log(temp);
  // // 写入 俊杰的剪切板
  changeSavingModuleData(temp);
  lock = false;
}

let lock = false;

// 粘贴Cell
export function Action_PasteCell(graph, option, callback = {}) {
  if (lock) return;
  lock = true;
  const { mxClipboard, setGraphDataMap, changeCheckedGraphBlockId } = option;
  const {
    grapheditor: {
      savingModuleData, // 俊杰的剪切板
    },
  } = store.getState();

  mxClipboard.paste(graph);

  const getMxId = useMxId();

  console.log(getMxId());

  //console.clear();
  console.log(graph.selectionModel.cells);

  graph.selectionModel.cells.forEach((item, index) => {
    console.log(`\n\n!!!\n\n`, item.getId());
    if (item.isVertex()) {
      try {
        console.log(savingModuleData[index]);
        //newMap.set(item.getId(), savingModuleData[index]);
        let tempId = getMxId();
        item.setId(tempId);
        setGraphDataMap(tempId, savingModuleData[index]);
        changeCheckedGraphBlockId(tempId);
        updateGraphDataAction(graph);
      } catch (e) {
        console.log(e);
      }
    }
  });

  //lock = false;
}

const copyModule = id => {
  const {
    grapheditor: {
      graphDataMap, // 数据map
    },
  } = store.getState();
  console.log(graphDataMap);

  const { pythonCode, ...data } = graphDataMap.get(id);
  return cloneDeep(data);
};
