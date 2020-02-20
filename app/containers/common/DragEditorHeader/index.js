import React from 'react';
import { Icon } from 'antd';
import { withRouter } from 'react-router-dom';

import event, {
  PYTHON_EXECUTE,
} from '../../designerGraphBlock/layout/eventCenter';
import { usePublishProcessZip } from '../../designerGraphBlock/layout/useHooks';
import { usePublishProcess } from '../../designerGraphEdit/useHooks';
import IconFont from '../IconFont/index';

import './index.scss';

const handleOperation = op => (...args) => {
  event.emit(op, ...args);
};

export default withRouter(({ history }) => {
  const handlePublishZip = usePublishProcessZip();

  const handlePublishProcess = usePublishProcess();

  const TOOLS_DESCRIPTION = [
    {
      description: '返回',
      type: 'rollback',
      IconFont: false,
      onClick: () => {
        history.goBack();
      },
    },
    {
      description: '保存',
      type: 'save',
      onClick: handlePublishProcess,
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
});
