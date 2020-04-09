import React from 'react';
import {
  NodeMenu,
  EdgeMenu,
  GroupMenu,
  MultiMenu,
  CanvasMenu,
  ContextMenu,
} from 'gg-editor';
import MenuItem from './MenuItem';

import './index.scss';

const FlowContextMenu = () => {
  return (
    <ContextMenu className="contextMenu">
      <NodeMenu>
        <MenuItem command="copy" text="复制" />
        <MenuItem command="添加到复用" text="添加到复用" />
        <MenuItem command="delete" text="删除" />
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
