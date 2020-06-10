import React, { useMemo, useEffect } from 'react';
import { Tabs } from 'antd';
import { useSelector } from 'react-redux';
import GGEditor from 'gg-editor';
import useThrottle from 'react-hook-easier/lib/useThrottle';

import { useTransformToPython } from '../useHooks';
import ParamPanel from './ParamPanel';
import { findNodeById } from '../shared/utils';
import GraphContainer from '../../../designerGraphEdit/layout/GraphContainer';
import VariablePanel from '../../../designerGraphEdit/layout/GraphParamPanel/components/VariablePanel';

const { TabPane } = Tabs;
let isMouseDown = false;
let startOffset = 0;

const getCheckedBlock = (cards, checkedId) => {
  return findNodeById(cards, checkedId);
};

const getCheckedId = (checkedId) => {
  if (Array.isArray) {
    if (checkedId.length === 1) {
      return checkedId[0];
    }
  }
  return checkedId;
};

export default ({ current }) => {
  const data = useSelector((state) => state.blockcode);
  const checkedBlock = getCheckedBlock(
    data.cards,
    getCheckedId(data.checkedId)
  );
  const cards = useSelector((state) => state.blockcode.cards);

  const handleEmitCodeTransform = useTransformToPython();

  const checkedGraphBlockId = useSelector(
    (state) => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector((state) => state.grapheditor.graphDataMap);

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};
  const inputParams = useMemo(
    () =>
      blockNode.properties &&
      Array.isArray(blockNode.properties) &&
      blockNode.properties.find((item) => item.enName === 'param').value,
    [blockNode]
  );
  const outputParams = useMemo(
    () =>
      blockNode.properties &&
      Array.isArray(blockNode.properties) &&
      blockNode.properties.find((item) => item.enName === 'output').value,
    [blockNode]
  );

  const getParamPanelWidth = () => {
    const outputDom = document.querySelector('.dragger-editor-parampanel');
    return parseFloat(window.getComputedStyle(outputDom).width);
  };

  useEffect(() => {
    const handleAnchorMouseMove = useThrottle((e) => {
      if (isMouseDown) {
        let offset = startOffset - e.pageX; // 偏移量
        startOffset = e.pageX;
        // if (e.clientX <= 239) return;
        const outputDom = document.querySelector('.dragger-editor-parampanel');
        const originWidth = getParamPanelWidth();
        const currentWidth = originWidth + offset;
        outputDom.style.flexBasis = currentWidth + 'px';

        if (currentWidth < 130) {
          outputDom.style.display = 'none';
          console.log(document.querySelector('.container-right').style.display);
          document.querySelector('.container-right').style.display = '';
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
      className="dragger-editor-parampanel"
      onMouseDown={(e) => {
        isMouseDown = true;
        startOffset = e.pageX;
      }}
    >
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Tabs className="dragger-editor-parampanel-tabs">
          <TabPane tab="属性" key="1">
            {checkedBlock && (
              <ParamPanel
                onMouseDown={(e) => {
                  console.log('aaaa');
                }}
                checkedBlock={checkedBlock}
                handleEmitCodeTransform={handleEmitCodeTransform}
                key={checkedBlock.id}
                cards={cards}
              />
            )}
          </TabPane>
          <TabPane tab="变量" key="2">
            <VariablePanel
              blockNode={{
                variable: inputParams,
              }}
              handleEmitCodeTransform={() => handleEmitCodeTransform(cards)}
              label="输入参数"
              disabled={true}
            />
            <VariablePanel
              blockNode={{
                variable: outputParams,
              }}
              handleEmitCodeTransform={() => handleEmitCodeTransform(cards)}
              label="输出参数"
              disabled={false}
            />
            <VariablePanel
              blockNode={blockNode}
              handleEmitCodeTransform={() => handleEmitCodeTransform(cards)}
            />
          </TabPane>
          <TabPane tab="流程图" key="3">
            <GGEditor>
              <div style={{ height: 'calc(100vh - 116px)' }}>
                <GraphContainer showHead />
              </div>
            </GGEditor>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
