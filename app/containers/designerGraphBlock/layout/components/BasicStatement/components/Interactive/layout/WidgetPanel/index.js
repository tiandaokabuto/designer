import React from 'react';
import { Collapse } from 'antd';

import InteractiveControl from '../../components/InteractiveControl';

const { Panel } = Collapse;

export default () => {
  return (
    <div className="interactive-collapse">
      <Collapse accordion>
        <Panel header="自定义布局" key="1">
          button
        </Panel>
        <Panel header="基本控件" key="2">
          input
        </Panel>
      </Collapse>
      {/* <InteractiveControl item={{ type1: 'input' }} /> */}
    </div>
  );
};
