import React from 'react';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

export default () => {
  return (
    <div className="designergraph-parampanel">
      <Tabs className="designergraph-parampanel-tabs">
        <TabPane tab="属性" key="1">
          1
        </TabPane>
        <TabPane tab="变量" key="2">
          2
        </TabPane>
        <TabPane tab="命令" key="3">
          2
        </TabPane>
      </Tabs>
    </div>
  );
};
