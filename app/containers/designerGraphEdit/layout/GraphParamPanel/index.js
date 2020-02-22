import React from 'react';
import { Tabs } from 'antd';

import ProperitiesPanel from './components/ProperitiesPanel';
import BlockCodePanel from './components/BlockCodePanel';

const { TabPane } = Tabs;

export default () => {
  return (
    <div className="designergraph-parampanel">
      <Tabs className="designergraph-parampanel-tabs">
        <TabPane tab="属性" key="1">
          <ProperitiesPanel />
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
