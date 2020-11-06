import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Tabs from '../../components/Tabs';
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

  const [panelKey, setPanelKey] = useState('properties');

  const getParamPanelWidth = () => {
    const rightDom = document.querySelector('.designergraph-parampanel');
    return parseFloat(window.getComputedStyle(rightDom).width);
  };

  const getDesignergraphItemWidth = () => {
    const leftDom = document.querySelector('.designergraph-item');
    return parseFloat(window.getComputedStyle(leftDom).width);
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

  const showPanel = () => {
    if (panelKey === 'properties') {
      return (
        <ProperitiesPanel
          checkedGraphBlockId={checkedGraphBlockId}
          graphData={graphData}
          graphDataMap={graphDataMap}
          blockNode={blockNode}
        />
      );
    } else if (panelKey === 'variables') {
      return <VariablePanel blockNode={blockNode} />;
    } else if (panelKey === 'blockcode') {
      return <BlockCodePanel />;
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

        // 处理搜索框
        const searchDom = document.querySelector(
          '.dragger-editor-container-output-search'
        );
        const searchInfo = searchDom.getBoundingClientRect();
        const leftWidth = getDesignergraphItemWidth();
        if (searchInfo.x - leftWidth < 140) {
          searchDom.style.visibility = 'hidden';
        } else {
          searchDom.style.visibility = 'visible';
        }

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
      isMouseDown = false;
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleAnchorMouseMove);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleAnchorMouseMove);
    };
  }, []);

  const tabDatas = [
    {
      key: 'properties',
      name: '属性',
      className: 'designergraph-item-tab',
    },
    {
      key: 'variables',
      name: '变量',
      className: 'designergraph-item-tab',
    },
    {
      key: 'blockcode',
      name: '命令',
      className: 'designergraph-item-tab',
    },
  ];

  return (
    <div
      className="designergraph-parampanel"
      onMouseDown={e => {
        isMouseDown = true;
        startOffset = e.pageX;
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          // height: 'calc(100vh - 76px)',
        }}
        onMouseDown={e => {
          e.stopPropagation();
        }}
      >
        <Tabs
          tabDatas={tabDatas}
          wrapperClass={'designergraph-item-tabs'}
          variable={panelKey}
          onChangeFunction={setPanelKey}
          linePosition={'bottom'}
        />
        <div
          style={{
            height: 'calc(100vh - 120px)',
            overflowY: 'auto',
            // marginTop: 10,
          }}
          onKeyDown={e => {
            if (e.keyCode === 46) {
              e.nativeEvent.stopImmediatePropagation();
              e.stopPropagation();
            }
          }}
        >
          {showPanel()}
        </div>

        {/* <Tabs className="designergraph-parampanel-tabs">
          <TabPane tab="属性" key="1"></TabPane>
          <TabPane tab="变量" key="2"></TabPane>
          <TabPane tab="命令" key="3"></TabPane>
        </Tabs> */}
      </div>
    </div>
  );
};
