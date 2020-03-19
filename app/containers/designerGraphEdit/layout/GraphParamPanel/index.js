import React from 'react';
import { useSelector } from 'react-redux';
import { Tabs } from 'antd';

import ProperitiesPanel from './components/ProperitiesPanel';
import BlockCodePanel from './components/BlockCodePanel';

const { TabPane } = Tabs;

export default () => {
  const checkedGraphBlockId = useSelector(
    state => state.grapheditor.checkedGraphBlockId
  );
  const graphDataMap = useSelector(state => state.grapheditor.graphDataMap);

  const blockNode = graphDataMap.get(checkedGraphBlockId) || {};
  return (
    <div className="designergraph-parampanel">
      <Tabs className="designergraph-parampanel-tabs">
        <TabPane tab="属性" key="1">
          <ProperitiesPanel
            checkedGraphBlockId={checkedGraphBlockId}
            graphDataMap={graphDataMap}
            blockNode={blockNode}
          />
        </TabPane>
        <TabPane tab="变量" key="2">
          2
        </TabPane>
        <TabPane tab="命令" key="3">
          <BlockCodePanel />
        </TabPane>
      </Tabs>
    </div>
  );
};
