import React, { useEffect } from 'react';
import { Collapse, Button } from 'antd';

import InteractiveControl from '../components/InteractiveControl';

const { Panel } = Collapse;

export let isLocked = false;

export default ({ onAddControl, setCheckedGridItemId, popLayoutData }) => {
  useEffect(() => {
    // 获取左侧基础组件
    const controlDom = document.querySelectorAll('.interactive-control');

    // 鼠标在组件上时
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

    // 鼠标离开组件时
    const handleControlMouseleave = e => {
      isLocked = false;
      popLayoutData();
    };

    // 把类数组controlDom转换成数组进行遍历，绑定事件
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
              value: "''",
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
              value: "''",
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
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '文件上传',
              type: 'file-upload',
              desc: '提示信息，说明',
              value: "''",
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '文件下载',
              type: 'file-download',
              desc: '提示信息，说明',
              value: "''",
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '下拉框',
              type: 'drop-down',
              desc: '提示信息，说明',
              value: "''",
              key: '赋值的变量名',
              dataSource: '数据源',
              selectedType: 'radio',
            }}
          />
          <InteractiveControl
            onAddControl={onAddControl}
            item={{
              label: '多图上传',
              type: 'images-upload',
              desc: '提示信息，说明',
              value: '[]',
            }}
          />
        </Panel>
      </Collapse>
    </div>
  );
};
