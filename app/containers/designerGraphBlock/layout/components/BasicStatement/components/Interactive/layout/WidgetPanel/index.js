import React, { useEffect } from 'react';
import { Collapse, Button } from 'antd';

import InteractiveControl from '../components/InteractiveControl';

const { Panel } = Collapse;

export let isLocked = false;

export default ({ onAddControl, setCheckedGridItemId, popLayoutData }) => {
  useEffect(() => {
    const controlDom = document.querySelectorAll('.interactive-control');
    const handleControlMouseenter = e => {
      if (!isLocked) {
        isLocked = true;
        onAddControl(
          {
            ...JSON.parse(e.target.dataset.item),
            preset: true,
          },
          true,
          isLocked
        );
      }
    };
    const handleControlMouseleave = e => {
      isLocked = false;
      popLayoutData();
    };

    Array.from(controlDom).forEach(dom => {
      dom.addEventListener('mouseenter', handleControlMouseenter);
      dom.addEventListener('mouseleave', handleControlMouseleave);
    });
    return () => {
      Array.from(controlDom).forEach(dom => {
        dom.addEventListener('mouseenter', handleControlMouseenter);
        dom.removeEventListener('mouseleave', handleControlMouseleave);
      });
    };
  }, []);
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
              value: '显示值',
              key: '赋值的变量名',
              password: 'false',
              validRule: '',
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '图片控件',
              type: 'image',
              desc: '提示信息，说明',
              value: '显示值',
              key: '赋值的变量名',
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '提交按钮',
              type: 'submit-btn',
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '取消按钮',
              type: 'cancel-btn',
            }}
          />
        </Panel>
      </Collapse>
    </div>
  );
};
