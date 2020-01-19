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

const FlowContextMenu = () => {
  return (
    <ContextMenu className="editor-contextMenu">
      <NodeMenu>
        <MenuItem command="跳转到代码块编辑区" />
        <MenuItem command="copy" />
        <MenuItem command="delete" />
      </NodeMenu>
      <EdgeMenu>
        <MenuItem command="delete" />
      </EdgeMenu>
      <GroupMenu>
        <MenuItem command="copy" />
        <MenuItem command="delete" />
        <MenuItem command="unGroup" icon="ungroup" text="Ungroup" />
      </GroupMenu>
      <MultiMenu>
        <MenuItem command="copy" />
        <MenuItem command="paste" />
        <MenuItem command="addGroup" icon="group" text="Add Group" />
        <MenuItem command="delete" />
      </MultiMenu>
      <CanvasMenu>
        <MenuItem command="undo" />
        <MenuItem command="redo" />
        <MenuItem command="pasteHere" icon="paste" text="Paste Here" />
      </CanvasMenu>
    </ContextMenu>
  );
};

export default FlowContextMenu;
