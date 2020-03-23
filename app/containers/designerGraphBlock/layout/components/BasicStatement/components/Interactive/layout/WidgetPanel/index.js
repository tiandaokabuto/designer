import React from 'react';
import { Collapse, Button } from 'antd';

import InteractiveControl from '../../components/InteractiveControl';

const { Panel } = Collapse;

export default () => {
  return (
    <div className="interactive-collapse">
      <Collapse accordion>
        <Panel header="布局设置" key="1">
          <Button>自定义布局</Button>
        </Panel>
        <Panel header="基本控件" key="2">
          <InteractiveControl item={{ name: '文本控件' }} />
          <InteractiveControl item={{ name: '图片控件' }} />
        </Panel>
      </Collapse>
    </div>
  );
};
