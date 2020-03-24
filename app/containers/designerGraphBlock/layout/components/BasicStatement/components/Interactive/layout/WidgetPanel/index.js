import React from 'react';
import { Collapse, Button } from 'antd';

import InteractiveControl from '../../components/InteractiveControl';

const { Panel } = Collapse;

export default ({ onAddControl }) => {
  return (
    <div className="interactive-collapse">
      <Collapse accordion>
        <Panel header="基本控件" key="2">
          <InteractiveControl
            onAddControl={onAddControl}
            item={{ name: '文本控件' }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{ name: '图片控件' }}
          />
        </Panel>
      </Collapse>
    </div>
  );
};
