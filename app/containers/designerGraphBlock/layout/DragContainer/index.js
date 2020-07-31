import React from 'react';
import { Tabs, Icon } from 'antd';
import { useSelector } from 'react-redux';

import ProcessBlock from './ProcessBlock';
import CodeEditing from './CodeEditing';
import OutputPanel from './OutputPanel';

import './index.scss';

const { TabPane } = Tabs;

const DragContainer = () => {
  const graphData = useSelector(state => state.grapheditor.graphData);
  const { checkedGraphBlockId } = useSelector(state => state.grapheditor);
  let nodesLabel = {};
  if (graphData.nodes) {
    nodesLabel = graphData.nodes.find(item => item.id === checkedGraphBlockId);
  }
  return (
    <div className="dragger-editor-container">
      <div
        className="container-left"
        style={{ display: 'none' }}
        onClick={() => {
          const outputDom = document.querySelector('.dragger-editor-item');
          outputDom.style.display = '';
          outputDom.style.flexBasis = '288px';
          localStorage.setItem('secondLeft', '288');
          localStorage.setItem('secondLeftHide', 'false');
          document.querySelector('.container-left').style.display = 'none';
        }}
      >
        <Icon type="double-right" />
      </div>
      <div
        className="container-right"
        style={{ display: 'none' }}
        onClick={() => {
          const outputDom = document.querySelector(
            '.dragger-editor-parampanel'
          );
          outputDom.style.display = '';
          outputDom.style.flexBasis = '288px';
          localStorage.setItem('secondRight', '288');
          localStorage.setItem('secondRightHide', 'false');
          document.querySelector('.container-right').style.display = 'none';
        }}
      >
        <Icon type="double-left" />
      </div>
      <div className="dragger-editor-title">
        {nodesLabel ? nodesLabel.label : ''}
      </div>
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
