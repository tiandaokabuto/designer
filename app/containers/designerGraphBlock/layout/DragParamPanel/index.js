import React from 'react';
import { Tabs } from 'antd';
import { useSelector } from 'react-redux';
import GGEditor from 'gg-editor';

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

  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};

  return (
    <div className="dragger-editor-parampanel">
      <Tabs className="dragger-editor-parampanel-tabs">
        <TabPane tab="属性" key="1">
          {checkedBlock && <ParamPanel checkedBlock={checkedBlock} />}
        </TabPane>
        <TabPane tab="变量" key="2">
          <VariablePanel blockNode={blockNode} />
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
