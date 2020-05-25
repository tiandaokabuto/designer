import React, { useState } from 'react';
import { Icon, Input, Tabs } from 'antd';
import { useSelector } from 'react-redux';

import ProcessTree from './components/ProcessTree';
import { useChangeProjectName } from '../../useHooks';
import { changeTreeTab } from '../../../reduxActions';

import './GraphContainer.scss';

const { TabPane } = Tabs;
export default ({ setShowLoadingLayer }) => {
  const currentProject = useSelector(state => state.grapheditor.currentProject);
  const treeTab = useSelector(state => state.grapheditor.treeTab);
  const changeProjectName = useChangeProjectName();
  const [editVisible, setEditVisible] = useState(false);
  return (
    <div className="designergraph-item">
      <div className="designergraph-item-title">
        {editVisible ? (
          <Input
            style={{
              marginTop: 3,
              width: 180,
            }}
            defaultValue={currentProject}
            autoFocus
            onChange={e => {
              changeProjectName(currentProject, e.target.value);
            }}
            onBlur={e => {
              setEditVisible(false);
            }}
          />
        ) : (
          <span className="current-project-name">{currentProject}</span> || (
            <span className="current-project-name">当前无项目</span>
          )
        )}
        <Icon
          type="edit"
          style={{
            visibility: currentProject && !editVisible ? 'visible' : 'hidden',
            // marginLeft: 12,
          }}
          onClick={() => {
            setEditVisible(true);
          }}
        />
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: '0',
          maxWidth: '239px',
        }}
      >
        <Tabs
          defaultActiveKey={treeTab}
          className="dragger-editor-container-tabs"
          tabPosition="bottom"
          onChange={key => {
            changeTreeTab(key);
          }}
        >
          <TabPane tab="流程" key="process">
            <ProcessTree
              type="process"
              setShowLoadingLayer={setShowLoadingLayer}
            />
          </TabPane>
          <TabPane tab="流程块" key="processModule">
            <ProcessTree
              type="processModule"
              setShowLoadingLayer={setShowLoadingLayer}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* <Tree>{renderTreeNodes(processTree)}</Tree> */}
    </div>
  );
};
