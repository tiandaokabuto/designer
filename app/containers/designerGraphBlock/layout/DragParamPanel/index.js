import React, { useMemo } from 'react';
import { Tabs } from 'antd';
import { useSelector } from 'react-redux';
import GGEditor from 'gg-editor';

import { useTransformToPython } from '../useHooks';
import ParamPanel from './components/ParamPanel';
import { findNodeById } from '../shared/utils';
import GraphContainer from '../../../designerGraphEdit/layout/GraphContainer';
import VariablePanel from '../../../designerGraphEdit/layout/GraphParamPanel/components/VariablePanel';

const { TabPane } = Tabs;

const getCheckedBlock = (cards, checkedId) => {
  return findNodeById(cards, checkedId);
};

export default ({ current }) => {
  const data = useSelector(state => state.blockcode);
  const checkedBlock = getCheckedBlock(data.cards, data.checkedId);
  const cards = useSelector(state => state.blockcode.cards);

  const handleEmitCodeTransform = useTransformToPython();

  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};
  const inputParams = useMemo(
    () =>
      blockNode.properties &&
      Array.isArray(blockNode.properties) &&
      blockNode.properties.find(item => item.enName === 'param').value,
    [blockNode]
  );

  return (
    <div className="dragger-editor-parampanel">
      <Tabs className="dragger-editor-parampanel-tabs">
        <TabPane tab="属性" key="1">
          {checkedBlock && (
            <ParamPanel
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
            blockNode={blockNode}
            handleEmitCodeTransform={() => handleEmitCodeTransform(cards)}
          />
        </TabPane>
        <TabPane tab="流程图" key="3">
          <GGEditor>
            <div style={{ height: 'calc(100vh - 81px)' }}>
              <GraphContainer showHead={true} />
            </div>
          </GGEditor>
        </TabPane>
      </Tabs>
    </div>
  );
};
