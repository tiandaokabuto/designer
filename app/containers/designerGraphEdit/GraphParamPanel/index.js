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
    const rightDom = document.querySelector('.designergraph-parampanel');
    return parseFloat(window.getComputedStyle(rightDom).width);
  };

  const setGraphParamWidth = () => {
    const rightDom = document.querySelector('.designergraph-parampanel');
    const rightWidth = localStorage.getItem('firstRight');
    if (rightWidth === '0px' || rightWidth === '0' || rightWidth === '-1') {
      rightDom.style.display = 'none';
      document.querySelector('.container-right').style.display = '';
      rightDom.style.width = '0px';
    } else {
      document.querySelector('.container-right').style.display = 'none';
      rightDom.style.width = rightWidth + 'px';
    }
  };

  useEffect(() => {
    setGraphParamWidth();
    const handleAnchorMouseMove = useThrottle(e => {
      if (isMouseDown) {
        let offset = startOffset - e.pageX; // 偏移量
        startOffset = e.pageX;
        // if (e.clientX <= 239) return;
        const rightDom = document.querySelector('.designergraph-parampanel');
        const originWidth = getParamPanelWidth();
        const currentWidth = originWidth + offset;
        rightDom.style.width = currentWidth + 'px';

        // 工具栏
        const toolDom = document.querySelector(
          '.designergraph-container-header'
        );
        // 输出面板
        const outputDom = document.querySelector(
          '.dragger-editor-container-output'
        );
        // 左侧面板
        const itemDom = document.querySelector('.designergraph-item');

        // 输出面板宽度调整
        outputDom.style.width = `calc(100vw - ${rightDom.style.width} - ${itemDom.style.width})`;
        try {
          // 工具栏宽度调整
          toolDom.style.width = `calc(100vw - ${rightDom.style.width} - ${itemDom.style.width})`;
        } catch (e) {
          console.log(e);
        }

        localStorage.setItem('firstRight', currentWidth);

        if (currentWidth < 130) {
          rightDom.style.display = 'none';
          rightDom.style.width = '0px';
          // 输出面板宽度调整
          console.log(`${itemDom.style.width}`);
          outputDom.style.width = `calc(100vw - ${itemDom.style.width})`;
          // 工具栏宽度调整
          try {
            toolDom.style.width = `calc(100vw - ${itemDom.style.width})`;
          } catch (e) {
            console.log(e);
          }

          localStorage.setItem('firstRight', '0px');
          document.querySelector('.container-right').style.display = '';
          handleMouseUp();
        }
      }
    }, 0);

    const handleMouseUp = () => {
      console.log('松开鼠标');
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
      onMouseDown={e => {
        isMouseDown = true;
        startOffset = e.pageX;
      }}
    >
      <div
        onMouseDown={e => {
          e.stopPropagation();
        }}
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
