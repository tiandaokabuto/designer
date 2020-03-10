/**
 * 高亮流程块
 */
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { withPropsAPI } from 'gg-editor';

import {
  updateGraphData,
  synchroGraphDataToProcessTree,
} from '../../reduxActions';

let prevCheckedId = undefined;
let num = 0;

export default withPropsAPI(({ propsAPI }) => {
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  useEffect(() => {
    const { find, executeCommand, update, save } = propsAPI;
    if (!checkedGraphBlockId) return;
    // 恢复之前的样式
    if (prevCheckedId && prevCheckedId !== checkedGraphBlockId) {
      const prevItem = find(prevCheckedId);
      try {
        prevCheckedId = undefined;
        executeCommand(
          update(prevItem, {
            style: {
              stroke: '#60a8f8',
              fill: '#e9f7fe',
            },
          })
        );
      } catch (err) {
        // console.log(err);
      }
    }
    const item = find(checkedGraphBlockId);
    if (!item) return;
    try {
      prevCheckedId = checkedGraphBlockId;
      executeCommand(
        update(item, {
          style: {
            stroke: '#3c90f7',
            fill: '#9ed4fb',
          },
        })
      );
    } catch (err) {
      console.log(err);
    }
  }, [checkedGraphBlockId]);
  return null;
});
