import React from 'react';
import { Drawer } from 'antd';

import FlowDetailPanel from '../EditorDetailPanel/FlowDetailPanel';

export default ({ visible, setDrawerVisible }) => {
  return (
    <Drawer
      title="Basic Drawer"
      placement="right"
      closable={false}
      visible={visible}
      onClose={() => setDrawerVisible(false)}
    >
      <FlowDetailPanel />
    </Drawer>
  );
};
