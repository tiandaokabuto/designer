import React from 'react';
import { Collapse, Button } from 'antd';

import InteractiveControl from '../components/InteractiveControl';

const { Panel } = Collapse;

export default ({ onAddControl, setCheckedGridItemId }) => {
  return (
    <div className="interactive-collapse">
      <Collapse defaultActiveKey={['1', '2']}>
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
              label: '文本框',
              type: 'input',
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
