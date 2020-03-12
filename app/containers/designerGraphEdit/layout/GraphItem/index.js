import React, { useState } from 'react';
import { Icon, Input } from 'antd';
import { useSelector } from 'react-redux';

import ProcessTree from './components/ProcessTree';
import { useChangeProjectName } from '../../useHooks';

export default () => {
  const currentProject = useSelector(state => state.grapheditor.currentProject);
  const changeProjectName = useChangeProjectName();
  const [editVisible, setEditVisible] = useState(false);
  return (
    <div className="designergraph-item">
      <div className="designergraph-item-title">
        {editVisible ? (
          <Input
            defaultValue={currentProject}
            autoFocus
            onChange={e => {
              changeProjectName(currentProject, e.target.value);
            }}
            onBlur={() => {
              setEditVisible(false);
            }}
          />
        ) : (
          currentProject || '当前无项目'
        )}
        <Icon
          type="edit"
          style={{
            visibility: currentProject && !editVisible ? 'visible' : 'hidden',
            marginLeft: 12,
          }}
          onClick={() => {
            setEditVisible(true);
          }}
        />
      </div>
      <ProcessTree />
      {/* <Tree>{renderTreeNodes(processTree)}</Tree> */}
    </div>
  );
};
