import React from 'react';
import { Tabs } from 'antd';
// import { useSelector } from 'react-redux';

const { TabPane } = Tabs;

export default ({ current }) => {
  // const data = useSelector(state => state.paramPanel.current);
  // console.log(data, 'data');
  return (
    <div className="dragger-editor-parampanel">
      <Tabs className="dragger-editor-parampanel-tabs">
        <TabPane tab="属性" key="1">
          {/* {data} */}
        </TabPane>
        <TabPane tab="变量" key="2">
          2
        </TabPane>
        <TabPane tab="流程图" key="3">
          2
        </TabPane>
      </Tabs>
    </div>
  );
};
