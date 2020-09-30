import React, { useState } from 'react';
import { Tabs } from 'antd';
import ComponentPanel from './ComponentPanel';
import LayoutPanel from './LayoutPanel';

const { TabPane } = Tabs;

export default props => {
  const {
    handleAddComponent,
    device,
    setDevice,
    layout,
    setLayout,
    usedLayout,
    setUsedLayout,
  } = props;

  return (
    <Tabs
      defaultActiveKey="1"
      style={{ width: '100%' }}

      // onChange={this.handleChangeTabs.bind(this)}
    >
      <TabPane tab="组件面板" key="1">
        <ComponentPanel handleAddComponent={handleAddComponent} />
      </TabPane>
      <TabPane tab="布局面板" key="2">
        <LayoutPanel
          handleAddComponent={handleAddComponent}
          currentDevice={device}
          setCurrentDevice={setDevice}
          layout={layout}
          setLayout={setLayout}

          usedLayout={usedLayout}
          setUsedLayout={setUsedLayout}
        />
      </TabPane>
    </Tabs>
  );
};
