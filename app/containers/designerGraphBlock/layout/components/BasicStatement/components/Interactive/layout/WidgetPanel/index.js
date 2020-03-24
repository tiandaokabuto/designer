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
            item={{
              name: '文本控件',
              poperties: {
                label: '名称',
                type: '类型：输入框、下拉框',
                position: '坐标',
                size: '尺寸',
                desc: '提示信息，说明',
                defaultValue: '默认值',
                key: '赋值的变量名',
              },
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              name: '图片控件',
              poperties: {
                label: '名称',
                type: '类型：输入框、下拉框',
                position: '坐标',
                size: '尺寸',
                desc: '提示信息，说明',
                defaultValue: '默认值',
                key: '赋值的变量名',
              },
            }}
          />
        </Panel>
      </Collapse>
    </div>
  );
};
