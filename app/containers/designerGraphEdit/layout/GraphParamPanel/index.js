import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Tabs } from 'antd';

import ProperitiesPanel from './components/ProperitiesPanel';
import BlockCodePanel from './components/BlockCodePanel';
import VariablePanel from './components/VariablePanel';

const { TabPane } = Tabs;

import useThrottle from 'react-hook-easier/lib/useThrottle';

let isMouseDown = false;
let startOffset = 0;

export default () => {
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const graphData = useSelector(state => state.grapheditor.graphData);

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};

  const getParamPanelWidth = () => {
    const outputDom = document.querySelector('.designergraph-parampanel');
    return parseFloat(window.getComputedStyle(outputDom).width);
  };

  useEffect(() => {
    const handleAnchorMouseMove = useThrottle(e => {
      if (isMouseDown) {
        let offset = startOffset - e.pageX; // 偏移量
        startOffset = e.pageX;
        // if (e.clientX <= 239) return;
        const outputDom = document.querySelector('.designergraph-parampanel');
        const originWidth = getParamPanelWidth();
        const currentWidth = originWidth + offset;
        outputDom.style.flexBasis = currentWidth + 'px';
        if (currentWidth < 120) {
          outputDom.style.display = 'none';
        }
      }
    }, 0);

    const handleMouseUp = () => {
      isMouseDown = false;
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleAnchorMouseMove);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleAnchorMouseMove);
    };
  }, []);

  return (
    <div
      className="designergraph-parampanel"
      // onMouseDown={e => {
      //   isMouseDown = true;
      //   startOffset = e.pageX;
      // }}
    >
      <div
      // onMouseDown={e => {
      //   e.stopPropagation();
      // }}
      >
        <Tabs className="designergraph-parampanel-tabs">
          <TabPane tab="属性" key="1">
            <ProperitiesPanel
              checkedGraphBlockId={checkedGraphBlockId}
              graphData={graphData}
              graphDataMap={graphDataMap}
              blockNode={blockNode}
            />
          </TabPane>
          <TabPane tab="变量" key="2">
            <VariablePanel blockNode={blockNode} />
          </TabPane>
          <TabPane tab="命令" key="3">
            <BlockCodePanel />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
