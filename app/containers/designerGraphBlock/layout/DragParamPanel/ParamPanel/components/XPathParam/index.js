import React, { useState, useEffect, memo } from 'react';
import { Modal, Button, Input, Table, Radio } from 'antd';
import cloneDeep from 'lodash/cloneDeep';

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

let prevConfig = null;

// {
//   "XPath": ["//a[text()='工单管理']", "/html/body/div[1]/ul[1]/li[2]/a[1]"],
//   "JSpath": ["body > div:nth-child(1) > ul:nth-child(4) > li:nth-child(2) > a:nth-child(1)"],
//   "iframe": ["//iframe[@id='myIframe']", "//frame[@name='topFrame']"]
// }

const { TextArea } = Input;
export default memo(
  ({ param, markBlockIsUpdated, handleEmitCodeTransform }) => {
    param.config = param.config || {};
    const [_, forceUpdate] = useState(0);
    const [visible, setVisible] = useState(false);
    const [iframeData, setIframeData] = useState([]);
    const [data, setData] = useState({ xpathData: [], JSpathData: [] });
    const [selectedOption, setSelectedOption] = useState('xpath');
    const [xpath, setXpath] = useState('');

    const handleRadioChecked = (index, checked) => {
      new Promise((resolve) => {
        setData((data) => {
          const temp =
            selectedOption === 'xpath' ? data.xpathData : data.JSpathData;
          const result = temp.concat();
          result.forEach((item, i) => {
            if (i !== index) {
              item.checked = false;
            } else {
              item.checked = checked;
              resolve(item.xpath);
            }
          });
          return { ...data };
        });
      }).then((xpathTemp) => {
        setXpath(
          JSON.stringify({
            [selectedOption === 'xpath' ? 'XPath' : 'JSpath']: xpathTemp,
            iframe: param.config.iframe || [],
          })
        );
      });
    };

    const handleGenerateXpath = () => {
      const { xpathData, JSpathData } = data;
      const find = (selectedOption === 'xpath' ? xpathData : JSpathData).find(
        (item) => item.checked
      );
      if (find) {
        setXpath(
          JSON.stringify({
            [selectedOption === 'xpath' ? 'XPath' : 'JSpath']: find.xpath,
            iframe: param.config.iframe || [],
          })
        );
      } else {
        setXpath('');
      }
    };

    const xpathTitle = [
      {
        title: '选择',
        dataIndex: 'checked',
        width: 68,
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
        title:
          selectedOption === 'xpath' ? 'xpath列表(单选)' : 'JSpath列表(单选)',
        dataIndex: 'xpath',
        render: (text, obj) => {
          return (
            <Input
              defaultValue={text}
              key={visible && selectedOption === 'xpath' ? '0' : '1'}
              onChange={(e) => {
                obj.xpath = e.target.value;
                handleGenerateXpath();
              }}
            />
          );
        },
      },
    ];

    useEffect(() => {
      const { iframe = [], XPath = [], JSpath = [], selectedOption } =
        param.config || {};
      setIframeData(
        iframe.map((xpath, index) => ({
          key: index,
          xpath,
          index: '0' + ++index,
        }))
      );
      setData({
        xpathData: XPath,
        JSpathData: JSpath,
      });

      setSelectedOption(selectedOption);
    }, [param.config]);

    useEffect(() => {
      handleGenerateXpath();
    }, [selectedOption, param.config, data]);

    useEffect(() => {
      const { iframe = [], XPath = [], JSpath = [], selectedOption } =
        param.config || {};
      const find = (selectedOption === 'xpath' ? XPath : JSpath).find(
        (item) => item.checked
      );
      param.value = find
        ? JSON.stringify(
            JSON.stringify({
              [selectedOption === 'xpath' ? 'XPath' : 'JSpath']: find.xpath,
              iframe: param.config.iframe || [],
            })
          )
        : '';
    }, [param.config]);

    return (
      <div className="xpathParam">
        <TextArea style={{ height: 32 }} value={xpath} />
        <Button
          onClick={() => {
            prevConfig = cloneDeep(param.config);
            setVisible(true);
          }}
        >
          ...
        </Button>
        <Modal
          title="xpath"
          visible={visible}
          width={630}
          bodyStyle={{
            height: '60vh',
            overflow: 'auto',
          }}
          onCancel={() => {
            if (prevConfig) {
              param.config = prevConfig;
            }
            forceUpdate((_) => ++_);
            setVisible(false);
          }}
          onOk={() => {
            setVisible(false);
            param.value = JSON.stringify(xpath);
            markBlockIsUpdated();
            handleEmitCodeTransform();
          }}
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
            <Radio.Group
              value={selectedOption}
              onChange={(e) => {
                param.config.selectedOption = e.target.value;
                setSelectedOption(e.target.value);
              }}
            >
              <Radio value="xpath">xpath</Radio>
              <Radio value="selector">选择器(selector)</Radio>
            </Radio.Group>
          </div>
          <div className="xpathParam-title">元素xpath</div>
          <Table
            columns={xpathTitle}
            dataSource={
              selectedOption === 'xpath' ? data.xpathData : data.JSpathData
            }
            pagination={false}
            rowKey="key"
          />
        </Modal>
      </div>
    );
  }
);
