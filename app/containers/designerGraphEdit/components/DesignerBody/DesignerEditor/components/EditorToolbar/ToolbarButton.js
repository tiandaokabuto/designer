import React from 'react';
import { Tooltip } from 'antd';
import upperFirst from 'lodash/upperFirst';
import { Command } from 'gg-editor';
import IconFont from '../../../../../../../common/IconFont';

const ToolbarButton = props => {
  const { command, icon, text } = props;

  return (
    <Command name={command}>
      <Tooltip
        title={text || upperFirst(command)}
        placement="bottom"
        overlayClassName="editor-toolbar-tooltip"
      >
        <IconFont type={`icon-${icon || command}`} />
      </Tooltip>
    </Command>
  );
};

export default ToolbarButton;
