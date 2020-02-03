import React from 'react';
import { Icon } from 'antd';

import IconFont from '../../../../common/IconFont';

import './index.scss';

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
  },
  {
    description: '录制',
    type: 'iconrecordlight',
    IconFont: true,
  },
  {
    description: '发布',
    type: 'cloud-upload',
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

export default () => {
  return (
    <div className="drageditor-header">
      {TOOLS_DESCRIPTION.map((tool, index) => (
        <span key={index}>
          {tool.IconFont ? (
            <IconFont type={tool.type} />
          ) : (
            <Icon type={tool.type} />
          )}
          {tool.description}
        </span>
      ))}
    </div>
  );
};
