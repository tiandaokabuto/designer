import React, { useState, useEffect } from 'react';
import { Icon, Input, Tabs } from 'antd';
import { useSelector } from 'react-redux';
import useThrottle from 'react-hook-easier/lib/useThrottle';

import ProcessTree from './components/ProcessTree';
import { useChangeProjectName } from '../useHooks';
import { changeTreeTab } from '../../reduxActions';

import './GraphContainer.scss';

let isMouseDown = false;
let startOffset = 0;

const { TabPane } = Tabs;
export default ({ setShowLoadingLayer, createItem }) => {
  const currentProject = useSelector(state => state.grapheditor.currentProject);
  const treeTab = useSelector(state => state.grapheditor.treeTab);
  const changeProjectName = useChangeProjectName();
  const [editVisible, setEditVisible] = useState(false);

  const [showTree, setShowTree] = useState('process');

  const getDesignergraphItemWidth = () => {
    const leftDom = document.querySelector('.designergraph-item');
    return parseFloat(window.getComputedStyle(leftDom).width);
  };

  useEffect(() => {
    const handleAnchorMouseMove = useThrottle(e => {
      if (isMouseDown) {
        let offset = e.pageX - startOffset; // 偏移量
        // console.log('startOffset - e.pageX = ', offset);
        startOffset = e.pageX;
        // if (e.clientX <= 239) return;
        const leftDom = document.querySelector('.designergraph-item');
        const originWidth = getDesignergraphItemWidth();
        const currentWidth = originWidth + offset;
        leftDom.style.width = currentWidth + 'px';
        // 工具栏
        const toolDom = document.querySelector(
          '.designergraph-container-header'
        );
        // 输出面板
        const outputDom = document.querySelector(
          '.dragger-editor-container-output'
        );
        // 右侧面板
        const paramDom = document.querySelector('.designergraph-parampanel');

        // 输出面板位置调整
        outputDom.style.left = currentWidth + 'px';
        // 工具栏位置调整
        toolDom.style.left = currentWidth + 'px';
        // 输出面板宽度调整
        outputDom.style.width = `calc(100% - ${paramDom.style.width} - ${leftDom.style.width})`;
        // 工具栏宽度调整
        toolDom.style.width = `calc(100% - ${paramDom.style.width} - ${leftDom.style.width})`;
        // 工具栏位置调整

        // if (currentWidth < 120) {
        //   outputDom.style.display = 'none';
        // }
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
      className="designergraph-item"
      onMouseDown={e => {
        isMouseDown = true;
        startOffset = e.pageX;
      }}
    >
      <div
        style={{
          width: '100%',
        }}
        onMouseDown={e => {
          e.stopPropagation();
        }}
      >
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
          className="designergraph-item-tree"
          style={{
            height: 'calc(100vh - 155px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
          // style={{
          //   position: 'fixed',
          //   bottom: '0',
          //   maxWidth: '239px',
          // }}
        >
          <ProcessTree
            type={showTree === 'process' ? 'process' : 'processModule'}
            setShowLoadingLayer={setShowLoadingLayer}
            createItem={createItem}
          />
          {/* <ProcessTree
            type="processModule"
            setShowLoadingLayer={setShowLoadingLayer}
            createItem={createItem}
          /> */}
          {/* <Tabs
            defaultActiveKey={treeTab}
            className="dragger-editor-container-tabs"
            tabPosition="bottom"
            onChange={key => {
              changeTreeTab(key);
            }}
          > */}
          {/* <TabPane tab="流程" key="process">

            </TabPane>
            <TabPane tab="流程块" key="processModule">
              
            </TabPane> */}
          {/* </Tabs> */}
        </div>
        <div className="designergraph-item-tabs">
          <div
            className="designergraph-item-tab"
            onClick={() => setShowTree('process')}
            style={{
              color: showTree === 'process' ? 'rgba(50, 166, 127, 1)' : 'black',
            }}
          >
            <div
              className="tab-line"
              style={{
                border:
                  showTree === 'process'
                    ? '1px solid rgba(50, 166, 127, 1)'
                    : '1px solid white',
              }}
            ></div>
            <div className="tab-title">流程</div>
          </div>
          <div
            className="designergraph-item-tab"
            onClick={() => setShowTree('module')}
            style={{
              color: showTree === 'module' ? 'rgba(50, 166, 127, 1)' : 'black',
            }}
          >
            <div
              className="tab-line"
              style={{
                border:
                  showTree === 'module'
                    ? '1px solid rgba(50, 166, 127, 1)'
                    : '1px solid white',
              }}
            ></div>
            <div className="tab-title">流程块</div>
          </div>
        </div>
      </div>
    </div>
  );
};
