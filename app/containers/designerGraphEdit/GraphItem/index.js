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

  const getDesignergraphItemWidth = () => {
    const outputDom = document.querySelector('.designergraph-item');
    return parseFloat(window.getComputedStyle(outputDom).width);
  };

  useEffect(() => {
    const handleAnchorMouseMove = useThrottle(e => {
      if (isMouseDown) {
        let offset = e.pageX - startOffset; // 偏移量
        // console.log('startOffset - e.pageX = ', offset);
        startOffset = e.pageX;
        // if (e.clientX <= 239) return;
        const outputDom = document.querySelector('.designergraph-item');
        const originWidth = getDesignergraphItemWidth();
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
      className="designergraph-item"
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
                createItem={createItem}
              />
            </TabPane>
            <TabPane tab="流程块" key="processModule">
              <ProcessTree
                type="processModule"
                setShowLoadingLayer={setShowLoadingLayer}
                createItem={createItem}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
