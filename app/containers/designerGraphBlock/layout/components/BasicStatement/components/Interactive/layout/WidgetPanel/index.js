import React from 'react';
import { Collapse, Button } from 'antd';

import InteractiveControl from '../components/InteractiveControl';

const { Panel } = Collapse;

export default ({ onAddControl, setCheckedGridItemId }) => {
  return (
    <div className="interactive-collapse">
      <Collapse>
        <Panel header="布局设置" key="1">
          <Button
            onClick={() => {
              setCheckedGridItemId('layout');
            }}
          >
            自定义布局
          </Button>
        </Panel>
        <Panel header="基础控件" key="2">
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
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '提交按钮',
              type: 'submit-btn',
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
              label: '取消按钮',
              type: 'cancel-btn',
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
