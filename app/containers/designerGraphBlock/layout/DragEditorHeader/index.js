import React from 'react';
import { Icon } from 'antd';

import event, { PYTHON_EXECUTE } from '../eventCenter';
import { usePublishProcessZip } from '../useHooks';
import IconFont from '../../../../common/IconFont';

import './index.scss';

const handleOperation = op => (...args) => {
  event.emit(op, ...args);
};

export default () => {
  const handlePublishZip = usePublishProcessZip();

  const TOOLS_DESCRIPTION = [
    {
      description: '返回',
      type: 'rollback',
      IconFont: false,
    },
    {
      description: '保存',
      type: 'save',
    },
    {
      description: '运行',
      type: 'iconzhihang',
      IconFont: true,
      onClick: handleOperation(PYTHON_EXECUTE),
    },
    {
      description: '录制',
      type: 'iconrecordlight',
      IconFont: true,
    },
    {
      description: '发布',
      type: 'cloud-upload',
      onClick: handlePublishZip,
    },
    {
      description: '导出',
      type: 'upload',
    },
    {
      description: '控制台',
      type: 'desktop',
    },
  ];
  return (
    <div className="drageditor-header">
      {TOOLS_DESCRIPTION.map((tool, index) => (
        <span key={index}>
          {tool.IconFont ? (
            <IconFont type={tool.type} onClick={tool.onClick || (() => {})} />
          ) : (
            <Icon type={tool.type} onClick={tool.onClick || (() => {})} />
          )}
          {tool.description}
        </span>
      ))}
    </div>
  );
};
