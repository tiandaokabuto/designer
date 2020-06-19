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
const { confirm } = Modal;
export default memo(
  ({ param, markBlockIsUpdated, handleEmitCodeTransform }) => {
    param.config = param.config || {
      XPath: [],
      JSpath: [],
      selectedOption: 'xpath',
    };
    const [_, forceUpdate] = useState(0);
    const [visible, setVisible] = useState(false);
    const [iframeData, setIframeData] = useState([]);
    const [data, setData] = useState({
      xpathData: param.config.XPath,
      JSpathData: param.config.JSpath,
    });
    const [selectedOption, setSelectedOption] = useState(
      param.config.selectedOption
    );
    const find = (param.config.selectedOption === 'xpath'
      ? param.config.XPath
      : param.config.JSpath
    ).find(item => item.checked);
    let value = '';
    if (find) {
      value = JSON.stringify({
        [selectedOption === 'xpath' ? 'XPath' : 'JSpath']: find.xpath,
        iframe: param.config.iframe || [],
      });
    }
    const [xpath, setXpath] = useState(value);
    const [clientXpath, setClientXpath] = useState(param.value);

    const handleRadioChecked = (index, checked) => {
      setData(data => {
        const temp =
          selectedOption === 'xpath' ? data.xpathData : data.JSpathData;
        const result = temp.concat();
        result.forEach((item, i) => {
          if (i !== index) {
            item.checked = false;
          } else {
            item.checked = checked;
          }
        });
        return { ...data };
      });
    };

    const handleGenerateXpath = () => {
      const { xpathData, JSpathData } = data;
      const find = (selectedOption === 'xpath' ? xpathData : JSpathData).find(
        item => item.checked
      );
      if (find) {
        const value = JSON.stringify({
          [selectedOption === 'xpath' ? 'XPath' : 'JSpath']: find.xpath,
          iframe: param.config.iframe || [],
        });
        if (value !== xpath) {
          setXpath(value);
          setClientXpath(JSON.stringify(value));
        }
      } else {
        setXpath('');
        setClientXpath('');
      }
    };

    const isClientXpathChange = () => {
      return (
        clientXpath !== '' &&
        xpath !== '' &&
        clientXpath !== JSON.stringify(xpath)
      );
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
              onChange={e => {
                const newChecked = e.target.checked;
                const { target } = e;
                if (isClientXpathChange()) {
                  new Promise((resolve, reject) => {
                    showConfirm(resolve, reject);
                  })
                    .then(() => {
                      handleRadioChecked(index, newChecked);
                      return checked;
                    })
                    .catch(err => {
                      console.log(err);
                      return false;
                    });
                } else {
                  handleRadioChecked(index, newChecked);
                }
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
              onChange={e => {
                const newValue = e.target.value;
                const { target } = e;
                if (isClientXpathChange()) {
                  new Promise((resolve, reject) => {
                    showConfirm(resolve, reject);
                  })
                    .then(() => {
                      obj.xpath = newValue;
                      handleGenerateXpath();
                      return newValue;
                    })
                    .catch(err => {
                      target.value = text;
                    });
                } else {
                  obj.xpath = newValue;
                  handleGenerateXpath();
                }
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
      const newData = {
        xpathData: XPath,
        JSpathData: JSpath,
      };
      if (JSON.stringify(data) !== JSON.stringify(newData)) {
        setData(newData);
      }

      setSelectedOption(selectedOption);
    }, [param.config]);

    useEffect(() => {
      handleGenerateXpath();
    }, [selectedOption, param.config, data]);

    useEffect(() => {
      setClientXpath(param.value);
    }, []);

    const showConfirm = (resolve, reject) => {
      confirm({
        title: '你确定要执行该操作吗',
        content: '该操作会覆盖自定义xpath',
        onOk() {
          if (resolve) resolve();
        },
        onCancel() {
          if (reject) reject();
        },
      });
    };

    return (
      <div className="xpathParam">
        <TextArea
          style={{ height: 32 }}
          className="xpathInput"
          value={isClientXpathChange() ? clientXpath : xpath}
          disabled
        />
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
            if (
              prevConfig &&
              JSON.stringify(prevConfig) !== JSON.stringify(param.config)
            ) {
              param.config = prevConfig;
              setClientXpath(param.value);
            }
            forceUpdate(_ => ++_);
            setVisible(false);
          }}
          onOk={() => {
            setVisible(false);
            param.value = clientXpath;
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
              onChange={e => {
                param.config.selectedOption = e.target.value;
                if (isClientXpathChange()) {
                  new Promise(resolve => {
                    showConfirm(resolve);
                  })
                    .then(() => {
                      setSelectedOption(e.target.value);
                      return e.target.value;
                    })
                    .catch(err => console.log(err));
                } else setSelectedOption(e.target.value);
              }}
            >
              <Radio value="xpath">xpath</Radio>
              <Radio value="selector">选择器(selector)</Radio>
            </Radio.Group>
          </div>
          <div className="xpathParam-title">元素xpath</div>
          <Table
            className="xpathTable"
            columns={xpathTitle}
            dataSource={
              selectedOption === 'xpath' ? data.xpathData : data.JSpathData
            }
            pagination={false}
            rowKey="key"
          />
          <div className="xpathParam-title">自定义xpath</div>
          <TextArea
            value={clientXpath}
            onChange={e => {
              if (e.target.value === '') {
                setClientXpath(JSON.stringify(xpath));
              } else setClientXpath(e.target.value);
            }}
          />
        </Modal>
      </div>
    );
  }
);
