import React from 'react';
import { message } from 'antd';
import { deleteCellAction } from '../mxgraphAction';
import { getNodeInfo } from '../rules/checkRules';

import { findSameLevelCell } from './findSameLevelCell';

let tepmCellParent;

// 删除cell
export function Action_DeleteCell(graph, opt = {}, callback = {}) {
  const { deleteGraphDataMap, changeCheckedGraphBlockId, graphData } = opt;

  const cells = graph.getSelectionCells();

  if (cells.length > 1) {
    return message.info('不能同时选中多个进行删除');
  }

  if (!cells[0].isVertex()) {
    // 假如是一根线，直接干掉他
  } else {
    let error = false;
    const checkSonsHasProcess = sons => {
      sons.forEach(son => {
        console.log(son);
        if (son.shape === 'processblock') {
          return (error = true);
        } else {
          checkSonsHasProcess(findSameLevelCell(graphData, son.id));
        }
      });
    };

    if (cells[0].value === '开始') {
      return message.info('开始不能删除');
    }

    if (cells[0].value === '异常捕获') {
      const sons = findSameLevelCell(graphData, cells[0].id);
      checkSonsHasProcess(sons);
      if (error)
        return message.info(
          '不能删除非空的容器，请先删除内部流程块或拖出内部流程块后删除'
        );
    } else if (cells[0].value === '异常处理' || cells[0].value === '结束') {
      return message.info('try和catch块不能单独删除');
    }

    if (
      cells[0].value.search(`for`) >= 0 ||
      cells[0].value.search(`while`) >= 0
    ) {
      const sons = findSameLevelCell(graphData, cells[0].id);
      checkSonsHasProcess(sons);
      if (error)
        return message.info(
          '不能删除非空的容器，请先删除内部流程块或拖出内部流程块后删除'
        );
    }
  }

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

  tepmCellParent = cells[0].parent;

  graph.removeCells(cells, true);

  cells.forEach(cell => {
    for (const [key, item] of Object.entries(graph.getModel().cells)) {
      if (cell.id === item.id) {
        // deleteGraphDataMap(item.id);
        delete graph.getModel().cells[key];
      }
    }
  });

  changeCheckedGraphBlockId('');

  deleteCellAction(graph);
}

export const getTempCellParent = () => {
  return tepmCellParent;
};
