import React, { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import GGEditor from 'gg-editor';
import useThrottle from 'react-hook-easier/lib/useThrottle';

import { useTransformToPython } from '../useHooks';
import ParamPanel from './ParamPanel';
import Tabs from '../../components/Tabs';
import { findNodeById } from '../../../utils/GraphBlockUtils/utils';
import VariablePanel from '../../designerGraphEdit/GraphParamPanel/components/VariablePanel';

const { TabPane } = Tabs;
let isMouseDown = false;
let startOffset = 0;

const getCheckedBlock = (cards, checkedId) => {
  return findNodeById(cards, checkedId);
};

const getCheckedId = checkedId => {
  if (Array.isArray) {
    if (checkedId.length === 1) {
      return checkedId[0];
    }
  }
  return checkedId;
};

export default ({ current }) => {
  const data = useSelector(state => state.blockcode);
  const checkedBlock = getCheckedBlock(
    data.cards,
    getCheckedId(data.checkedId)
  );
  const cards = useSelector(state => state.blockcode.cards);

  const handleEmitCodeTransform = useTransformToPython();

  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const [panelKey, setPanelKey] = useState('properties');

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};
  const inputParams = useMemo(
    () =>
      blockNode.properties &&
      Array.isArray(blockNode.properties) &&
      blockNode.properties.find(item => item.enName === 'param').value,
    [blockNode]
  );
  const outputParams = useMemo(
    () =>
      blockNode.properties &&
      Array.isArray(blockNode.properties) &&
      blockNode.properties.find(item => item.enName === 'output').value,
    [blockNode]
  );

  const getParamPanelWidth = () => {
    const outputDom = document.querySelector('.dragger-editor-parampanel');
    return parseFloat(window.getComputedStyle(outputDom).width);
  };

  const setParamPanelWidth = () => {
    const outputDom = document.querySelector('.dragger-editor-parampanel');
    const width = localStorage.getItem('secondRight');
    const rightHide = localStorage.getItem('secondRightHide');
    if (rightHide === 'true') {
      outputDom.style.display = 'none';
      document.querySelector('.container-right').style.display = '';
    }
    outputDom.style.flexBasis = width + 'px';
  };

  useEffect(() => {
    setParamPanelWidth();
    const handleAnchorMouseMove = useThrottle(e => {
      if (isMouseDown) {
        let offset = startOffset - e.pageX; // 偏移量
        startOffset = e.pageX;
        // if (e.clientX <= 239) return;
        const outputDom = document.querySelector('.dragger-editor-parampanel');
        const originWidth = getParamPanelWidth();
        const currentWidth = originWidth + offset;
        outputDom.style.flexBasis = currentWidth + 'px';
        localStorage.setItem('secondRight', currentWidth);
        if (currentWidth < 130) {
          outputDom.style.display = 'none';
          document.querySelector('.container-right').style.display = '';
          localStorage.setItem('secondRightHide', 'true');
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
  ];

  const showPanel = () => {
    if (panelKey === 'properties') {
      return (
        checkedBlock && (
          <ParamPanel
            onMouseDown={e => {
              console.log('aaaa');
            }}
            checkedBlock={checkedBlock}
            handleEmitCodeTransform={handleEmitCodeTransform}
            key={checkedBlock.id}
            cards={cards}
          />
        )
      );
    } else if (panelKey === 'variables') {
      return (
        <div
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 122px)',
          }}
        >
          <VariablePanel
            blockNode={{
              variable: inputParams,
            }}
            handleEmitCodeTransform={() => handleEmitCodeTransform(cards)}
            label="输入参数"
            disabled={true}
          />
          <VariablePanel
            cards={cards}
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
        </div>
      );
    }
  };

  return (
    <div
      className="dragger-editor-parampanel"
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
        {showPanel()}
      </div>
    </div>
  );
};
