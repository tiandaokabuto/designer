import React from 'react';
import { Tabs } from 'antd';
import { useSelector } from 'react-redux';

import ProcessBlock from './ProcessBlock';
import CodeEditing from './CodeEditing';
import OutputPanel from './OutputPanel';

import './index.scss';

const { TabPane } = Tabs;

const DragContainer = () => {
  const graphData = useSelector((state) => state.grapheditor.graphData);
  const { currentEditingId } = useSelector((state) => state.grapheditor);
  let nodesLabel = {}
  if(graphData.nodes) {
    nodesLabel = graphData.nodes.find(item => item.id === currentEditingId);
  }
  return (
    <div className="dragger-editor-container">
      <div className="dragger-editor-title">{nodesLabel.label}</div>
      <div className="dragger-editor-container-codeblock">
        <Tabs
          defaultActiveKey="codeblock"
          className="dragger-editor-container-tabs"
        >
          <TabPane tab="可视化" key="codeblock">
            <ProcessBlock />
          </TabPane>
          <TabPane tab="源代码" key="codesource">
            <CodeEditing />
          </TabPane>
        </Tabs>
        <OutputPanel tag="block" />
      </div>
    </div>
  );
};
export default DragContainer;
