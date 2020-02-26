import React from 'react';
import { Tabs } from 'antd';

import ProcessBlock from './ProcessBlock';
import CodeEditing from './CodeEditing';
import OutputPanel from './OutputPanel';

import './index.scss';

const { TabPane } = Tabs;

const DragContainer = () => {
  return (
    <div className="dragger-editor-container">
      <div className="dragger-editor-title">流程块1</div>
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
        <OutputPanel />
      </div>
    </div>
  );
};
export default DragContainer;
