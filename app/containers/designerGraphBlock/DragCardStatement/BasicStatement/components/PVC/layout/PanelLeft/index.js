import React, { useState } from 'react';
import { Tabs } from 'antd';
import ComponentPanel from './ComponentPanel';
import LayoutPanel from './LayoutPanel';

const { TabPane } = Tabs;

export default ({ handleAddComponent }) => {
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
                <LayoutPanel handleAddComponent={handleAddComponent} />
            </TabPane>
        </Tabs>
    );
};
