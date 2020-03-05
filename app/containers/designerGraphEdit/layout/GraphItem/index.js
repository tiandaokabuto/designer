import React from 'react';
import { Icon } from 'antd';
import { useSelector } from 'react-redux';

import ProcessTree from './components/ProcessTree';

export default () => {
  const currentProject = useSelector(state => state.grapheditor.currentProject);
  return (
    <div className="designergraph-item">
      <div className="designergraph-item-title">
        {currentProject || '未保存项目'}
      </div>
      <ProcessTree />
      {/* <Tree>{renderTreeNodes(processTree)}</Tree> */}
    </div>
  );
};
