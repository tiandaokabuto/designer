import React from 'react';
import { Collapse, Button } from 'antd';

import InteractiveControl from '../components/InteractiveControl';

const { Panel } = Collapse;

export default ({ onAddControl }) => {
  return (
    <div className="interactive-collapse">
      <Collapse accordion>
        <Panel header="基本控件" key="2">
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '文本控件',
              type: 'input',
              position: '坐标',
              size: '尺寸',
              desc: '提示信息，说明',
              defaultValue: '默认值',
              key: '赋值的变量名',
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '图片控件',
              type: 'image',
              position: '坐标',
              size: '尺寸',
              desc: '提示信息，说明',
              defaultValue: '默认值',
              key: '赋值的变量名',
            }}
          />
        </Panel>
      </Collapse>
    </div>
  );
};
