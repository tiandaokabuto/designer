import React, { useMemo, useRef } from 'react';
import {
  NodeMenu,
  EdgeMenu,
  GroupMenu,
  MultiMenu,
  CanvasMenu,
  ContextMenu,
} from 'gg-editor';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
import MenuItem from './MenuItem';

import './index.scss';

const FlowContextMenu = () => {
<<<<<<< HEAD
  // const checkedGraphBlockId = useSelector(
  //   state => state.grapheditor.checkedGraphBlockId
  // );
  // const graphData = useSelector(state => state.grapheditor.graphData);

  // const model = useMemo(() => {
  //   if (graphData.nodes && checkedGraphBlockId) {
  //     return graphData.nodes.find(item => item.id === checkedGraphBlockId);
  //   }
  //   return {};
  // }, [checkedGraphBlockId, graphData]);
=======
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphData = useSelector(state => state.grapheditor.graphData);

  const model = useMemo(() => {
    if (graphData.nodes && checkedGraphBlockId) {
      return graphData.nodes.find(item => item.id === checkedGraphBlockId);
    }
    return {};
  }, [checkedGraphBlockId, graphData]);
>>>>>>> c12b5cb7384310eac5699896c48a508115e36022

  return (
    <ContextMenu className="contextMenu">
      <NodeMenu>
        <MenuItem command="copy" text="复制" />
        <MenuItem command="delete" text="删除" />
<<<<<<< HEAD
        <MenuItem command="导出到本地" text="导出到本地" />
=======
        {model && model.shape === 'processblock' && (
          <MenuItem command="导出到本地" text="导出到本地" />
        )}
>>>>>>> c12b5cb7384310eac5699896c48a508115e36022
      </NodeMenu>

      <EdgeMenu>
        <MenuItem command="delete" text="删除" />
      </EdgeMenu>
      <GroupMenu>
        <MenuItem command="copy" text="复制" />
        <MenuItem command="delete" text="删除" />
        <MenuItem command="unGroup" icon="ungroup" text="Ungroup" />
      </GroupMenu>
      <MultiMenu>
        <MenuItem command="copy" />
        <MenuItem command="paste" />
        <MenuItem command="addGroup" icon="group" text="Add Group" />
        <MenuItem command="delete" />
      </MultiMenu>
      <CanvasMenu>
        <MenuItem command="undo" text="取消" />
        <MenuItem command="redo" text="重做" />
        <MenuItem command="pasteHere" icon="paste" text="粘贴到此处" />
      </CanvasMenu>
    </ContextMenu>
  );
};

export default FlowContextMenu;
