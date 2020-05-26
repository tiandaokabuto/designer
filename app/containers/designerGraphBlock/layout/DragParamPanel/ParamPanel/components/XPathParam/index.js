import React, { useState, useEffect, memo } from 'react';
import { Modal, Button, Input, Table, Radio } from 'antd';

import './index.scss';

const iframeTitle = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 68,
  },
  {
    title: 'xpath',
    dataIndex: 'xpath',
  },
  {
    title: '描述',
  },
];

// {
//   "XPath": ["//a[text()='工单管理']", "/html/body/div[1]/ul[1]/li[2]/a[1]"],
//   "JSpath": "body > div:nth-child(1) > ul:nth-child(4) > li:nth-child(2) > a:nth-child(1)",
//   "iframe": ["//iframe[@id='myIframe']", "//frame[@name='topFrame']"]
// }

const { TextArea } = Input;
export default memo(({ param }) => {
  const [visible, setVisible] = useState(false);
  const [iframeData, setIframeData] = useState([]);
  const [xpathData, setXpathData] = useState([]);

  const handleRadioChecked = (index, checked) => {
    setXpathData((data) => {
      const result = data.concat();
      result.forEach((item, i) => {
        if (i !== index) {
          item.checked = false;
        } else {
          item.checked = checked;
        }
      });
      return result;
    });
  };

  const xpathTitle = [
    {
      title: '选择',
      dataIndex: 'checked',
      render: (checked, obj, index) => {
        return (
          <Radio
            checked={checked}
            onChange={(e) => {
              handleRadioChecked(index, e.target.checked);
            }}
          />
        );
      },
    },
    {
      title: 'xpath列表(单选)',
      dataIndex: 'xpath',
    },
  ];

  useEffect(() => {
    const { iframe = [], XPath = [] } = param.config || {};
    setIframeData(
      iframe.map((xpath, index) => ({
        key: index,
        xpath,
        index: '0' + ++index,
      }))
    );
    setXpathData(
      XPath.map((xpath, index) => ({ key: index + '$', checked: false, xpath }))
    );
  }, [param.config]);
  return (
    <div className="xpathParam">
      <TextArea style={{ height: 32 }} />
      <Button onClick={() => setVisible(true)}>...</Button>
      <Modal
        title="xpath"
        visible={visible}
        width={630}
        bodyStyle={{
          height: '60vh',
          overflow: 'auto',
        }}
        onCancel={() => setVisible(false)}
      >
        <div className="xpathParam-title">iframe</div>
        <Table
          columns={iframeTitle}
          dataSource={iframeData}
          pagination={false}
          rowKey="key"
        />
        <div className="xpathParam-choice">
          <span className="xpathParam-choice-title">选择方法</span>
          <Radio.Group>
            <Radio value="xpath">xpath</Radio>
            <Radio value="selector">选择器(selector)</Radio>
          </Radio.Group>
        </div>
        <div className="xpathParam-title">元素xpath</div>
        <Table
          columns={xpathTitle}
          dataSource={xpathData}
          pagination={false}
          rowKey="key"
        />
      </Modal>
    </div>
  );
});
